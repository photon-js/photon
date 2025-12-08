import type { Photon } from "@photonjs/core";
import { resolvePhotonConfig } from "@photonjs/core/api";
import { resolveFirst, singleton } from "@photonjs/core/api/internal";
import { assert } from "@photonjs/core/errors";
import { photon as corePhoton, type InstallPhotonCoreOptions, installPhotonCore } from "@photonjs/core/vite";
import standaloner from "standaloner/vite";
import type { Plugin } from "vite";

interface PhotonPluginOptions {
  /**
   * Set this to true if you're using a framework that doesn’t integrate
   * with Photon directly but provides an SSR entry that exports
   * `default { fetch }`. Photon will automatically wrap that entry for you.
   * @experimental
   */
  autoWrapEntry?: boolean | string;
  /**
   * Create self-contained, deployable Node.js applications by bundling your code and including necessary dependencies.
   * @see {@link https://github.com/nitedani/standaloner/tree/main/standaloner}
   */
  standalone?: boolean | Parameters<typeof standaloner>[0];
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

const nodeTargets = new Set<string>(["node", "bun", "deno"]);

// Creates a server and listens for connections in Node/Deno/Bun
function serve(): Plugin[] {
  let userPort: number | undefined;
  let userHost: string | boolean | undefined;
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
          const opts = {};
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
      name: "photon:serve:transform-dev",
      apply: "serve",

      applyToEnvironment(env) {
        return env.config.consumer === "server";
      },

      config(userConfig) {
        userPort = userConfig.server?.port;
        userHost = userConfig.server?.host;
      },

      transform: {
        filter: {
          code: [/process\.env\.PORT/, /process\.env\.PHOTON_HOSTNAME/],
        },
        handler(code) {
          let newCode = code;
          let replaced = false;
          if (userPort) {
            newCode = newCode.replaceAll("process.env.PORT", JSON.stringify(String(userPort)));
            replaced = true;
          }
          if (typeof userHost === "string") {
            newCode = newCode.replaceAll("process.env.PHOTON_HOSTNAME", JSON.stringify(String(userHost)));
            replaced = true;
          }
          if (replaced) {
            return newCode;
          }
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

/**
 * Ensures that the default build environment has an input defined.
 */
function input() {
  return singleton({
    name: "photon:set-input",
    configResolved(config) {
      const envs = new Set([config.photon.defaultBuildEnv, "ssr"]);
      for (const envName of envs) {
        const env = config.environments[envName];
        if (envName === "ssr" && !env) continue;
        assert(env);
        const input = env.build.rollupOptions.input;
        if (
          !input ||
          (Array.isArray(input) && input.length === 0) ||
          (typeof input === "object" && !Object.keys(input).includes("index"))
        ) {
          env.build.rollupOptions.input = {
            ...(input && typeof input === "object" ? input : {}),
            index: "virtual:photon:server-entry",
          };
        }
      }
    },
  });
}

// Export photon function that includes core plugins + fallback
export function photon(config?: Photon.Config & PhotonPluginOptions): Plugin[] {
  const plugins = [...corePhoton(config)];

  plugins.push(fallback());
  plugins.push(...serve());
  plugins.push(input());

  if (config?.autoWrapEntry) {
    plugins.push(wrapSsrEntry(config));
  }

  if (config?.standalone) {
    plugins.push(...standaloner(typeof config.standalone === "object" ? config.standalone : {}));
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

  return [fallback(), ...serve(), input(), ...plugins];
}
