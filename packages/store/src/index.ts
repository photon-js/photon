import type { Store } from "./types.js";

export type * from "./types.js";

const storeSymbol = Symbol.for("photon:store");
// biome-ignore lint/suspicious/noExplicitAny: cast
(globalThis as any)[storeSymbol] ||= { entries: [] } satisfies Store;
// biome-ignore lint/suspicious/noExplicitAny: cast
export const store: Store = (globalThis as any)[storeSymbol];

export const catchAllEntry = "virtual:photon:catch-all" as const;
