import { walk } from "estree-walker";
import MagicString from "magic-string";
import type { Plugin } from "vite";
import { assert, assertUsage } from "../../utils/assert.js";
import { resolvePhotonConfig } from "../../validators/coerce.js";
import { singleton } from "../utils/dedupe.js";
import { importsToServer } from "../utils/servers.js";
import { asPhotonEntryId, ifPhotonModule, virtualModules, virtualModulesRegex } from "../utils/virtual.js";

const serverImports = new Set(Object.keys(importsToServer));
const re_photonHandler = /[?&]photonHandler=/;

function cleanImport(imp: string) {
  const s = "virtual:photon:resolve-from-photon:";
  return imp.startsWith(s) ? imp.slice(s.length) : imp;
}

export function photonEntry(): Plugin[] {
  return [
    singleton({
      name: "photon:set-input",
      apply: "build",
      enforce: "post",

      applyToEnvironment(env) {
        return env.config.consumer === "server";
      },

      config: {
        order: "post",
        handler(config) {
          const { server } = resolvePhotonConfig(config.photon);
          const input: Record<string, string> = { index: server.id };

          return {
            environments: {
              ssr: {
                build: {
                  rollupOptions: {
                    input,
                  },
                },
              },
            },
          };
        },
      },

      resolveId: {
        filter: {
          id: [virtualModulesRegex["dynamic-entry"]],
        },
        handler(id) {
          return {
            id,
            moduleSideEffects: "no-treeshake",
          };
        },
      },

      load: {
        filter: {
          id: [virtualModulesRegex["dynamic-entry"]],
        },
        handler(id) {
          return ifPhotonModule("dynamic-entry", id, async ({ entry }) => {
            return `await import(${JSON.stringify(entry)});`;
          });
        },
      },

      sharedDuringBuild: true,
    }),
    singleton({
      name: "photon:resolve-importer",
      enforce: "pre",

      resolveId: {
        order: "post",
        handler(id, importer, opts) {
          return ifPhotonModule(["handler-entry", "server-entry"], importer, ({ entry }) => {
            if (entry) {
              return this.resolve(id, entry, {
                ...opts,
                skipSelf: false,
              });
            }
          });
        },
      },
      sharedDuringBuild: true,
    }),
    singleton({
      name: "photon:resolve-server-with-entry",
      enforce: "pre",

      resolveId: {
        filter: {
          id: virtualModulesRegex["server-entry-with-entry"],
        },
        order: "post",
        handler(id) {
          return ifPhotonModule("server-entry-with-entry", id, async ({ entry }) => {
            const handlerOrConfig = this.environment.config.photon.entries.find((e) => e.name === entry);
            assertUsage(handlerOrConfig, `Unable to find entry "${entry}"`);

            return {
              id,
              meta: {
                photon: {
                  ...this.environment.config.photon.server,
                  // Additional handler meta take precedence
                  ...handlerOrConfig,
                  type: "server",
                  id,
                  resolvedId: id,
                },
              },
              resolvedBy: "photon",
            };
          });
        },
      },

      load: {
        filter: {
          id: virtualModulesRegex["server-entry-with-entry"],
        },
        handler(id) {
          return ifPhotonModule("server-entry-with-entry", id, async ({ entry }) => {
            const resolved = await this.resolve(this.environment.config.photon.server.id, undefined, {
              isEntry: true,
            });
            assert(resolved);

            const loaded = await this.load({ id: resolved.id });
            assert(loaded.code);

            const handlerOrConfig = this.environment.config.photon.entries.find((e) => e.name === entry);
            assert(handlerOrConfig);

            const code = loaded.code;

            // All entries are bundled in server-config entries
            if (handlerOrConfig.type === "server-config") {
              return { code };
            }

            const ast = this.parse(code);
            const magicString = new MagicString(code);

            walk(ast, {
              enter(node) {
                if (
                  node.type === "ImportDeclaration" &&
                  typeof node.source.value === "string" &&
                  serverImports.has(cleanImport(node.source.value))
                ) {
                  let foundApply = false;
                  // Check if { apply } is among the imported specifiers
                  for (const specifier of node.specifiers) {
                    if (
                      specifier.type === "ImportSpecifier" &&
                      specifier.imported &&
                      "name" in specifier.imported &&
                      specifier.imported.name === "apply"
                    ) {
                      foundApply = true;
                      break;
                    }
                  }
                  if (foundApply) {
                    const { end } = node.source as unknown as { start: number; end: number };

                    // Adding a query parameter that will be used to rewrite `photon:get-middlewares` imports
                    magicString.appendRight(end - 1, `?${new URLSearchParams({ photonHandler: entry }).toString()}`);
                  }
                }
              },
            });

            if (!magicString.hasChanged()) return;

            return {
              code: magicString.toString(),
              map: magicString.generateMap(),
            };
          });
        },
      },

      sharedDuringBuild: true,
    }),
    singleton({
      name: "photon:transform-get-middlewares-import",
      enforce: "pre",

      resolveId: {
        filter: {
          id: re_photonHandler,
        },
        async handler(id, importer, opts) {
          const [actualId, query] = id.split("?");
          // biome-ignore lint/style/noNonNullAssertion: ensured by regex
          const resolved = await this.resolve(actualId!, importer, opts);
          assert(resolved);

          return {
            id: `${resolved.id}?${query}`,
            resolvedBy: "photon",
          };
        },
      },

      load: {
        filter: {
          id: re_photonHandler,
        },
        async handler(id) {
          const [actualId, query] = id.split("?");
          // biome-ignore lint/style/noNonNullAssertion: ensured by regex
          const loaded = await this.load({ id: actualId! });
          assert(loaded.code);

          const handlerId = new URLSearchParams(query).get("photonHandler");
          assert(handlerId);

          const newCode = loaded.code
            // Forward query parameters to apply imports
            .replace(/@photonjs\/core\/([^/]+)\/apply/, `@photonjs/core/$1/apply?${query}`)
            .replace(/@photonjs\/([^/]+)\/apply/, `@photonjs/$1/apply?${query}`)
            // Transform get-middleware import
            .replace(/virtual:photon:get-middlewares:(.+?):(\w+)/, `virtual:photon:get-middlewares:$1:$2:${handlerId}`);

          return {
            code: newCode,
            map: { mappings: "" },
          };
        },
      },
    }),
    singleton({
      name: "photon:resolve-server",
      enforce: "pre",

      resolveId: {
        filter: {
          id: virtualModulesRegex["server-entry"],
        },
        order: "post",
        handler(id, _importer, opts) {
          return ifPhotonModule("server-entry", id, async ({ entry: actualId }) => {
            const entry = this.environment.config.photon.server;

            if (!actualId) {
              const match = virtualModules["server-entry"].match(this.environment.config.photon.server.id);
              if (match?.entry) {
                actualId = match.entry;
              }
            }

            if (!actualId) {
              return this.resolve(this.environment.config.photon.server.id, undefined, {
                isEntry: true,
                custom: {
                  setPhotonMeta: entry,
                },
              });
            }

            const resolved = await this.resolve(actualId, undefined, {
              ...opts,
              isEntry: true,
              skipSelf: false,
              custom: {
                setPhotonMeta: entry,
              },
            });

            assertUsage(resolved, `Cannot resolve ${actualId} to a server entry`);

            entry.resolvedId = resolved.id;

            // Ensure early resolution of photon meta during build
            if (this.environment.config.command === "build") {
              await this.load({ ...resolved, resolveDependencies: true });
            }

            return {
              ...resolved,
              meta: {
                photon: entry,
              },
              resolvedBy: "photon",
            };
          });
        },
      },
      sharedDuringBuild: true,
    }),
    singleton({
      name: "photon:resolve-handler",
      enforce: "pre",

      resolveId: {
        filter: {
          id: virtualModulesRegex["handler-entry"],
        },
        order: "post",
        handler(id, _importer, opts) {
          return ifPhotonModule("handler-entry", id, async ({ entry: actualId }) => {
            const idWithPhotonPrefix = asPhotonEntryId(id, "handler-entry");
            const handlers = this.environment.config.photon.entries.filter((e) => e.type === "universal-handler");
            let entry = handlers.find((e) => asPhotonEntryId(e.id, "handler-entry") === idWithPhotonPrefix);

            let resolved = await this.resolve(actualId, undefined, {
              ...opts,
              isEntry: true,
              skipSelf: false,
              custom: {
                setPhotonMeta: entry,
              },
            });

            // Try to resolve by handler name
            if (!resolved) {
              const handler = handlers.find((e) => e.name === actualId);
              if (handler) {
                resolved = await this.resolve(handler.id, undefined, {
                  ...opts,
                  isEntry: true,
                  skipSelf: false,
                  custom: {
                    setPhotonMeta: entry,
                  },
                });
              }
            }

            assertUsage(resolved, `Cannot resolve ${actualId} to a handler entry`);

            if (!entry) {
              const resolvedIdWithPhotonPrefix = asPhotonEntryId(resolved.id, "handler-entry");
              entry = handlers.find((e) => {
                if (e.resolvedId) {
                  return e.resolvedId === resolved.id;
                }
                return e.id === resolvedIdWithPhotonPrefix;
              });
            }

            assertUsage(entry, `Cannot find a handler for ${resolved.id}`);
            entry.resolvedId = resolved.id;

            // Ensure early resolution of photon meta during build
            if (this.environment.config.command === "build") {
              await this.load({ ...resolved, resolveDependencies: true });
            }

            return {
              ...resolved,
              meta: {
                photon: entry,
              },
              resolvedBy: "photon",
            };
          });
        },
      },
      sharedDuringBuild: true,
    }),
    singleton({
      name: "photon:trickle-meta",
      enforce: "pre",

      async resolveId(id, imports, opts) {
        if (opts.custom?.setPhotonMeta) {
          const resolved = await this.resolve(id, imports, opts);

          if (!resolved) return;

          return {
            ...resolved,
            meta: {
              ...resolved.meta,
              photon: opts.custom.setPhotonMeta,
            },
          };
        }
      },
    }),
  ];
}
