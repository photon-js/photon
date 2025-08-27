import type { Plugin } from "vite";
import { photon as corePhoton } from "@photonjs/core/vite";

function fallback(): Plugin {
  return {
    name: "photon:fallback",

    resolveId(id) {
      if (id === "photon:fallback-entry") {
        return {
          id,
          meta: {
            photon: {
              id,
              resolvedId: id,
              type: "server",
              server: "hono",
            },
          },
        };
      }
    },

    load(id) {
      if (id === "photon:fallback-entry") {
        //language=ts
        return `import { apply, serve } from '@photonjs/hono'
import { Hono } from 'hono'

function startServer() {
  const app = new Hono()
  apply(app)
  return serve(app)
}

export default startServer()
`;
      }
    },
  };
}

// Export photon function that includes core plugins + fallback
export function photon(config?: any): Plugin[] {
  const plugins = corePhoton(config);

  plugins.push(fallback());

  return plugins;
}

// Make photon the default export as well
export { photon as default };
