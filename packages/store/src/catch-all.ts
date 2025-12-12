import { addRoute, createRouter } from "rou3";
import { compileRouterToString } from "rou3/compiler";
import type { Plugin } from "vite";
import { store } from "./index.js";

// A virtual module aggregating all routes defined in the store
const re_catchAll = /^virtual:photon:catch-all$/;
// Resolves to store.catchAllEntry
const re_photonServer = /^virtual:photon:server-entry$/;

// Current version compiles with rou3/compiler.
// For target supporting URLPattern, we could also provide a compiled version with native URLPattern support (smaller bundle).
// Also perhaps replace the rou3/compiler by a unique concatenated regex matcher (See https://github.com/honojs/hono/blob/57f214663ec63666d5a86620928f90af472e95a4/src/router/reg-exp-router/prepared-router.ts#L156).
export function catchAll(): Plugin {
  return {
    name: "photon:catch-all",
    resolveId: {
      filter: {
        id: {
          include: [re_catchAll, re_photonServer],
        },
      },
      async handler(id, importer) {
        return id === "virtual:photon:catch-all"
          ? id
          : this.resolve(store.catchAllEntry, importer, { skipSelf: false });
      },
    },
    load: {
      filter: {
        id: re_catchAll,
      },
      async handler() {
        const imports: string[] = [];
        const routesByKey: string[] = [];
        const router = createRouter<string>();

        let i = 0;
        for (const meta of store.entries.values()) {
          const resolved = await this.resolve(meta.id);
          if (!resolved) {
            throw new Error(`Failed to resolve ${meta.id}`);
          }

          // FIXME testing with rou3 patterns for now, but this will need transformation from actual URLPatternInit
          const rou3Path = meta.pattern as string;
          // TODO dedupe + warn
          imports.push(`import m${i} from ${JSON.stringify(resolved.id)};`);
          routesByKey.push(`m${i}`);
          addRoute(router, "", rou3Path, `m${i++}`);
        }

        // const findRoute=(m, p) => {}
        const compiledFindRoute = compileRouterToString(router, "findRoute");

        //language=js
        const code = `${imports.join("\n")}

const __map = {
  ${routesByKey.map((v) => `"${v}": ${v}`).join(",\n  ")}
};

${compiledFindRoute};

export default {
  fetch(request) {
    const url = new URL(request.url);
    const key = findRoute("", url.pathname);
    if (!key || !key.data) return;
    
    return __map[key.data].fetch(request);
  }
}`;
        return code;
      },
    },
  };
}
