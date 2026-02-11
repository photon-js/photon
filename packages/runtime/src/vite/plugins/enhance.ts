import { compileEnhance } from "@universal-middleware/core";
import type { Plugin } from "vite";
import { wrapper } from "vite-plugin-wrapper";

const re_catchAllDefault = /^virtual:ud:catch-all\?default$/;

export function photonEnhancePlugin(): Plugin {
  return wrapper({
    resolveId: {
      filter: {
        id: re_catchAllDefault,
      },
    },
    load(id: string) {
      const compiledEnhance = compileEnhance("mod.fetch", {
        path: "/**",
        method: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      });

      return `
export * from ${JSON.stringify(id)};
import mod from ${JSON.stringify(id)};

${compiledEnhance}
export default mod;
`;
    },
  });
}
