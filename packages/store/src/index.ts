import type { EntryMeta, Store } from "./types.js";

export type * from "./types.js";

const storeSymbol = Symbol.for("photon:store");
// biome-ignore lint/suspicious/noExplicitAny: cast
(globalThis as any)[storeSymbol] ||= { entries: new Map() };
// biome-ignore lint/suspicious/noExplicitAny: cast
export const store: Store = (globalThis as any)[storeSymbol];

export function addEntry(id: string, meta: EntryMeta) {
  if (store.entries.has(id)) {
    throw new Error(`Entry with id "${id}" already exists.`);
  }
  store.entries.set(id, meta);
}

export function setEntry(id: string, meta: EntryMeta) {
  store.entries.set(id, meta);
}

export function updateEntry(id: string, meta: EntryMeta): EntryMeta {
  const newMeta = {
    ...store.entries.get(id),
    ...meta,
  };
  store.entries.set(id, newMeta);
  return newMeta;
}
