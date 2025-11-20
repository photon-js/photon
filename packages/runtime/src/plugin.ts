import type { Photon } from "@photonjs/core";
import { resolvePhotonConfig } from "@photonjs/core/api";
import { resolveFirst, singleton } from "@photonjs/core/api/internal";
import { photon as corePhoton, type InstallPhotonCoreOptions, installPhotonCore } from "@photonjs/core/vite";
import type { Plugin } from "vite";

const re_photonFallback = /^virtual:photon:fallback-entry$/;
const re_photonServe = /^virtual:photon:serve-entry$/;

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
        // Compatibility with frameworks exposing a `{ fetch }` entry under `rollupOptions.input.index` in 'ssr' env
        if (this.environment.name === "ssr" && this.environment.config.build.rollupOptions.input) {
          const input = this.environment.config.build.rollupOptions.input;
          const inputStr =
            typeof input === "string"
              ? input
              : Array.isArray(input) && input.length > 0
                ? (input[0] as string)
                : input && "index" in input
                  ? (input.index as string)
                  : undefined;
          if (inputStr) {
            //language=js
            return `import { apply } from "virtual:photon:resolve-from-photon:@photonjs/srvx";
import { assertServerEntry } from "virtual:photon:resolve-from-photon:@photonjs/runtime/internal"
import { enhance } from "virtual:photon:resolve-from-photon:@universal-middleware/core";

import ssrEntry from ${JSON.stringify(input)};

assertServerEntry(ssrEntry);

const app = apply([
  enhance(
    ssrEntry.fetch,
    {
      name: "photon:catch-all",
      path: "/**",
      method: ["GET", "POST"],
    }
  )
]);

export default {
  fetch: app,
};
`;
          }
        }

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

      sharedDuringBuild: true,
    }),
  ];
}

// Export photon function that includes core plugins + fallback
export function photon(config?: Photon.Config): Plugin[] {
  const plugins = corePhoton(config);

  return [fallback(), ...serve(), ...plugins];
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
