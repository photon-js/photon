import type { Photon } from "@photonjs/core";
import { photon as corePhoton, type InstallPhotonCoreOptions, installPhotonCore } from "@photonjs/core/vite";
import type { Plugin } from "vite";

const re_photonFallback = /^virtual:photon:fallback-entry$/;
const re_photonWrapper = /^virtual:photon:server-entry-wrapper$/;

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

function fetchable(): Plugin {
  return {
    name: "photon:fetchable",

    resolveId: {
      filter: {
        id: re_photonWrapper,
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
        id: re_photonWrapper,
      },
      async handler() {
        const resolved = await this.resolve(this.environment.config.photon.server.id, undefined, {
          isEntry: true,
        });
        if (!resolved) {
          throw new Error(`Cannot find server entry ${JSON.stringify(this.environment.config.photon.server.id)}`);
        }
        const strServerId = JSON.stringify(resolved.id);

        //language=ts
        return `import { serve } from 'virtual:photon:resolve-from-photon:@photonjs/srvx';
import userServerEntry from ${strServerId};

if (!userServerEntry) {
  throw new Error('Missing export default in ${strServerId}');
}

function wrapper() {
  if (userServerEntry[Symbol.for("photon:server")]) {
    // apply() + serve() + { fetch? } app
    return userServerEntry;
  } else if (userServerEntry.fetch) {
    const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : undefined;

    function startServer() {
      return serve(userServerEntry.fetch, {port});
    }

    return startServer();
  }
  throw new Error('{ apply } function needs to be called before export in ${strServerId}');
}

export default wrapper();
`;
      },
    },
  };
}

// Export photon function that includes core plugins + fallback
export function photon(config?: Photon.Config): Plugin[] {
  const plugins = corePhoton(config);

  return [fallback(), fetchable(), ...plugins];
}

/**
 * All Photon's Vite plugins required for your library to operate correctly.
 * @param name Your package name as specified in package.json
 * @param options
 */
export function installPhoton(name: string, options?: InstallPhotonCoreOptions): Plugin[] {
  const plugins = installPhotonCore(name, options);

  return [fallback(), fetchable(), ...plugins];
}
