import type { Photon } from "@photonjs/core";
import { resolvePhotonConfig } from "@photonjs/core/api";
import { resolveFirst, singleton } from "@photonjs/core/api/internal";
import { photon as corePhoton, type InstallPhotonCoreOptions, installPhotonCore } from "@photonjs/core/vite";
import type { Plugin } from "vite";

interface PhotonPluginOptions {
  /**
   * Set this to true if you're using a framework that doesn’t integrate
   * with Photon directly but provides an SSR entry that exports
   * `default { fetch }`. Photon will automatically wrap that entry for you.
   */
  autoWrapEntry?: boolean | string;
}

const re_photonFallback = /^virtual:photon:fallback-entry$/;
const re_photonServe = /^virtual:photon:serve-entry$/;
const re_photonWrap = /^virtual:photon:wrap-fetch-entry:(.*)/;

function fallback(): Plugin {
  return singleton({
    name: "photon:fallback",

    resolveId: {
      filter: {
        id: re_photonFallback,
      },
      handler(id) {
        return {
          id,
          meta: {
            photon: {
              id,
              resolvedId: id,
              type: "server",
            },
          },
        };
      },
    },

    load: {
      filter: {
        id: re_photonFallback,
      },
      handler() {
        //language=js
        return `import { apply } from "virtual:photon:resolve-from-photon:@photonjs/srvx";

const app = apply();

export default {
  fetch: app,
};
`;
      },
    },
  });
}

function wrapSsrEntry(config?: Photon.Config & PhotonPluginOptions): Plugin {
  return singleton({
    name: "photon:wrap-fetch-entry",

    config: {
      handler(userConfig) {
        const input = userConfig.environments?.ssr?.build?.rollupOptions?.input;

        const inputStr =
          typeof config?.autoWrapEntry === "string"
            ? config.autoWrapEntry
            : typeof input === "string"
              ? input
              : Array.isArray(input) && input.length > 0
                ? (input[0] as string)
                : input && "index" in input
                  ? (input.index as string)
                  : undefined;

        if (!inputStr || inputStr === "virtual:photon:fallback-entry") return;

        const resolvedPhotonConfig = resolvePhotonConfig(userConfig.photon);

        if (resolvedPhotonConfig.server.id) {
          return {
            photon: {
              server: {
                id: `virtual:photon:wrap-fetch-entry:${inputStr}`,
              },
            },
          };
        }
      },
    },

    resolveId: {
      filter: {
        id: re_photonWrap,
      },
      handler(id) {
        return {
          id,
          meta: {
            photon: {
              id,
              resolvedId: id,
              type: "server",
            },
          },
        };
      },
    },

    load: {
      filter: {
        id: re_photonWrap,
      },
      handler(id) {
        const match = id.match(re_photonWrap);
        // biome-ignore lint/style/noNonNullAssertion: asserted by filter
        const actualId = match![1];

        //language=js
        return `import fetchableEntry from ${JSON.stringify(actualId)};
import { apply } from "virtual:photon:resolve-from-photon:@photonjs/srvx";
import { enhance } from 'virtual:photon:resolve-from-photon:@universal-middleware/core';

const app = apply([
  enhance(fetchableEntry.fetch, {
    name: "photon:fetchable-entry",
    immutable: true,
    path: "/**",
    method: ["GET", "POST"]
  })
]);

export default {
  fetch: app,
};
`;
      },
    },
  });
}

// Creates a server and listens for connections in Node/Deno/Bun
function serve(): Plugin[] {
  const nodeTargets = new Set<string>(["node", "bun", "deno"]);
  return [
    singleton({
      name: "photon:serve",

      resolveId: {
        filter: {
          id: re_photonServe,
        },
        async handler(id, importer) {
          const isDev = this.environment.config.command === "serve";
          const source = isDev ? "@photonjs/runtime/serve/dev" : "@photonjs/runtime/serve";
          const opts = { isEntry: true };
          const resolved = await resolveFirst(this, [
            { source: `virtual:photon:resolve-from-photon:${source}`, opts },
            { source: `virtual:photon:resolve-from-photon:${source}`, importer, opts },
          ]);

          if (!resolved) {
            throw new Error(`Cannot find server entry ${JSON.stringify(id)}`);
          }

          return {
            id: resolved.id,
            meta: {
              photon: {
                id,
                resolvedId: resolved.id,
              },
              photonConfig: {
                isTargetEntry: true,
              },
            },
          };
        },
      },
    }),
    singleton({
      name: "photon:serve:emit",

      apply: "build",
      enforce: "post",

      config: {
        order: "post",
        handler(config) {
          const photon = resolvePhotonConfig(config.photon);

          if (!photon.target || nodeTargets.has(photon.target)) {
            return {
              environments: {
                [photon.defaultBuildEnv]: {
                  build: {
                    rollupOptions: {
                      input: {
                        index: "virtual:photon:serve-entry",
                      },
                    },
                  },
                },
              },
            };
          }
        },
      },

      configResolved({ photon }) {
        // Add sirv middleware when targeting node, but only when fetchable entry is extracted from rollupOptions
        if (
          photon.server.id.includes("virtual:photon:wrap-fetch-entry:") &&
          (!photon.target || nodeTargets.has(photon.target))
        ) {
          photon.middlewares ??= [];
          photon.middlewares.push((condition) => {
            if (condition === "node") {
              return "@photonjs/runtime/sirv";
            }
          });
        }
      },

      sharedDuringBuild: true,
    }),
  ];
}

// Export photon function that includes core plugins + fallback
export function photon(config?: Photon.Config & PhotonPluginOptions): Plugin[] {
  const plugins = [...corePhoton(config)];

  plugins.push(fallback());
  plugins.push(...serve());

  if (config?.autoWrapEntry) {
    plugins.push(wrapSsrEntry(config));
  }

  return plugins;
}

/**
 * All Photon's Vite plugins required for your library to operate correctly.
 * @param name Your package name as specified in package.json
 * @param options
 */
export function installPhoton(name: string, options?: InstallPhotonCoreOptions): Plugin[] {
  const plugins = installPhotonCore(name, options);

  return [fallback(), ...serve(), ...plugins];
}
