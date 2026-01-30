/** biome-ignore-all lint/suspicious/noExplicitAny: cast */
import type { EntryMeta, Store } from "@universal-deploy/store";

type EntryTransformer = (entry: EntryMeta) => EntryMeta;

const MUTATING_ARRAY_METHODS = new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift",
]);

export function transformStoreInPlace(store: Store, transformer: EntryTransformer): void {
  if ((store as any)[Symbol.for("photon:transformed")]) return;
  (store as any)[Symbol.for("photon:transformed")] = true;

  const rawEntries = store.entries;

  store.entries = new Proxy(rawEntries, {
    get(arr, prop, receiver) {
      const value = Reflect.get(arr, prop, receiver);

      // Intercept ALL mutating array methods
      if (typeof prop === "string" && MUTATING_ARRAY_METHODS.has(prop)) {
        return (...args: any[]) => Array.prototype[prop as keyof any[]].apply(arr, args);
      }

      // Transform on read for numeric indices
      if (typeof prop === "string" && !Number.isNaN(Number(prop))) {
        return value != null ? transformer(value) : value;
      }

      return value;
    },

    set(arr, prop, value, receiver) {
      // Store raw values only
      return Reflect.set(arr, prop, value, receiver);
    },
  });
}
