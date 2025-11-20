import type { ViteDevServer } from "vite";

// @ts-expect-error
// biome-ignore lint/suspicious/noAssignInExpressions: allowed
export const globalStore = (globalThis.__vikeNode ||= {}) as {
  viteDevServer?: ViteDevServer | false;
};
