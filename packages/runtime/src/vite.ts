import { compileEnhance } from "@universal-middleware/core";
import type { Plugin } from "vite";

const re_enhanced = /[?&]enhanced\b/;
const re_catchAll = /^virtual:ud:catch-all\?default$/;

export function photon(): Plugin[] {
  return [
    // Node compat
    {
      name: "photon:node:node-entry",
      apply: "build",

      resolveId: {
        order: "pre",
        filter: {
          id: /^virtual:photon:node-entry$/,
        },
        async handler(id, importer) {
          const resolved = await this.resolve("@photonjs/runtime/serve", importer);
          if (!resolved) {
            throw new Error(`Cannot find server entry ${JSON.stringify(id)}`);
          }

          return {
            id: resolved.id,
          };
        },
      },
    },
    {
      name: "photon:wrap-enhance",
      enforce: "pre",

      resolveId: {
        filter: {
          id: [re_enhanced, re_catchAll],
        },
        async handler(id, importer) {
          if (importer?.match(re_enhanced)) return;
          if (id.match(re_catchAll)) {
            const resolved = await this.resolve(id, importer, { skipSelf: true });
            if (resolved) {
              return `\0${resolved.id}&enhanced`;
            }
          }
          return `\0${id}`;
        },
      },
      load: {
        filter: {
          // biome-ignore lint/suspicious/noControlCharactersInRegex: ok
          id: [/^\x00.*[?&]enhanced\b/],
        },
        handler(id) {
          const wrappedModule = id.slice(1).replace(re_enhanced, "");

          if (!wrappedModule.match(re_catchAll)) {
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
    },
  ];
}
