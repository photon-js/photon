import type { Plugin } from "vite";
import { store } from "./index.js";
import { dependsOn } from "./utils.js";

let added = false;

/**
 * Vite plugin that provides compatibility for resolving the SSR Rollup entry
 * and registers it in the shared `store.entries`.
 *
 * Notes:
 * - The effect is applied only once per process (guarded by an internal flag).
 * - It currently registers a catch-all route pattern.
 */
export function compat(config?: { entry?: string }): Plugin {
  return {
    name: "photon:rollup-ssr-entry-compat",

    config: {
      handler(userConfig) {
        if (added) return;
        const input = userConfig.environments?.ssr?.build?.rollupOptions?.input;

        const inputStr =
          typeof config?.entry === "string"
            ? config.entry
            : typeof input === "string"
              ? input
              : Array.isArray(input) && input.length > 0
                ? (input[0] as string)
                : input && "index" in input
                  ? (input.index as string)
                  : undefined;

        if (!inputStr) return;
        added = true;

        store.entries.push({
          id: inputStr,
          // FIXME change to URLPatternInit format
          pattern: "/**",
        });
      },
    },

    ...dependsOn("photon:catch-all"),
  };
}
