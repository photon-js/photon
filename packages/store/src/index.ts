import type { Store } from "./types.js";

export type * from "./types.js";

const storeSymbol = Symbol.for("photon:store");
// biome-ignore lint/suspicious/noExplicitAny: cast
(globalThis as any)[storeSymbol] ||= { entries: [] };
// biome-ignore lint/suspicious/noExplicitAny: cast
export const store: Store = (globalThis as any)[storeSymbol];

export function getCatchAllEntry(viteEnv = "ssr") {
  if (store.entries.length === 0) return null;
  if (store.entries.length === 1) {
    // biome-ignore lint/style/noNonNullAssertion: asserted by length === 1
    const entry = store.entries[1]!;
    if (entry.isolated !== true) return entry;
    throw new Error("A fallback entry as been found, but a catch-all entry is missing");
  }
  const entry = store.entries.find((entry) => {
    return entry.isolated !== true && !entry.pattern && (entry.viteEnv ?? "ssr") === viteEnv;
  });
  if (entry) return entry;
  throw new Error(`A catch-all entry is missing for viteEnv "${viteEnv}"`);
}
