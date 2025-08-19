import type { Plugin } from "vite";
import { singleton } from "../utils/dedupe.js";
import { ifPhotonModule } from "../utils/virtual.js";

export { fallback };

function fallback(): Plugin {
  return singleton({
    name: "photon:fallback",

    resolveId(id) {
      return ifPhotonModule("fallback-entry", id, () => {
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
      });
    },

    load(id) {
      return ifPhotonModule("fallback-entry", id, () => {
        //language=ts
        return {
          code: `
import { apply, serve } from 'photon:resolve-from-photon:@photonjs/core/hono'
import { Hono } from 'photon:resolve-from-photon:hono'

function startServer() {
  const app = new Hono()
  apply(app)
  return serve(app)
}

export default startServer()
`,
          map: { mappings: "" } as const,
        };
      });
    },
  });
}
