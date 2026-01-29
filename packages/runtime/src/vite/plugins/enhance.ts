import { compileEnhance } from "@universal-middleware/core";
import type { Plugin } from "vite";
import { createParam } from "../../utils.js";

const p_enhanced = createParam("enhanced");
const re_catchAllDefault = /^virtual:ud:catch-all\?default$/;

export function photonEnhancePlugin(): Plugin {
  return {
    name: "photon:wrap-enhance",
    enforce: "pre",

    resolveId: {
      filter: {
        id: [p_enhanced.re, re_catchAllDefault],
      },
      async handler(id, importer) {
        if (importer?.match(p_enhanced.re)) return;
        if (id.match(re_catchAllDefault)) {
          const resolved = await this.resolve(id, importer, { skipSelf: true });
          if (resolved) {
            return `\0${resolved.id}&${p_enhanced.param}`;
          }
        }
        return `\0${id}`;
      },
    },
    load: {
      filter: {
        id: p_enhanced.virtualRe,
      },
      handler(id) {
        const wrappedModule = id.slice(1).replace(p_enhanced.re, "");

        if (!wrappedModule.match(re_catchAllDefault)) {
          this.warn('?enhanced only supported by "virtual:ud:catch-all?default"');
          return;
        }

        const compiledEnhance = compileEnhance("mod.fetch", {
          path: "/**",
          method: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        });

        return `
export * from ${JSON.stringify(wrappedModule)};
import mod from ${JSON.stringify(wrappedModule)};
${compiledEnhance}
export default mod;
          `;
      },
    },
  };
}
