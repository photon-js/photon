import type { Photon } from "@photonjs/core";
import { photon as corePhoton, type InstallPhotonCoreOptions, installPhotonCore } from "@photonjs/core/vite";
import type { Plugin } from "vite";

const re_photonFallback = /^photon:fallback-entry$/;

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
        return `import { apply, serve } from 'photon:resolve-from-photon:@photonjs/srvx'

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

// Export photon function that includes core plugins + fallback
export function photon(config?: Photon.Config): Plugin[] {
  const plugins = corePhoton(config);

  return [fallback(), ...plugins];
}

/**
 * All Photon's Vite plugins required for your library to operate correctly.
 * @param name Your package name as specified in package.json
 * @param options
 */
export function installPhoton(name: string, options?: InstallPhotonCoreOptions): Plugin[] {
  const plugins = installPhotonCore(name, options);

  return [fallback(), ...plugins];
}
