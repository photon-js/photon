import type { Photon } from "@photonjs/core";
import { photon as corePhoton, type InstallPhotonCoreOptions, installPhotonCore } from "@photonjs/core/vite";
import type { Plugin } from "vite";

const re_photonFallback = /^virtual:photon:fallback-entry$/;
const re_photonServe = /^virtual:photon:serve-entry$/;

function fallback(): Plugin {
  return {
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
              server: "srvx",
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
        //language=ts
        return `import { apply, serve } from 'virtual:photon:resolve-from-photon:@photonjs/srvx'

        const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : undefined;

        function startServer() {
          const app = apply()
          return serve(app, { port })
        }

        export default startServer()
        `;
      },
    },
  };
}

// Creates a server and listens for connections in Node/Deno/Bun
function serve(): Plugin[] {
  const nodeTargets = new Set<string>(["node", "bun", "deno"]);
  return [
    {
      name: "photon:serve",

      resolveId: {
        filter: {
          id: re_photonServe,
        },
        async handler(id) {
          const isDev = this.environment.config.command === "serve";
          const resolved = await this.resolve(
            isDev
              ? "virtual:photon:resolve-from-photon:@photonjs/runtime/serve-dev"
              : "virtual:photon:resolve-from-photon:@photonjs/runtime/serve",
            undefined,
            {
              isEntry: true,
            },
          );
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
    },
    {
      name: "photon:serve:emit",

      apply: "build",
      enforce: "post",

      buildStart: {
        order: "post",
        handler() {
          const envName = this.environment.name;
          const photon = this.environment.config.photon;

          if (photon.defaultBuildEnv === envName && nodeTargets.has(photon.target)) {
            this.emitFile({
              type: "chunk",
              fileName: "node.js",
              id: `virtual:photon:serve-entry`,
            });
          }
        },
      },

      sharedDuringBuild: true,
    },
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
