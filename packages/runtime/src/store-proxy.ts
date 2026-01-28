import type { EntryMeta, Store } from "@universal-deploy/store";

type EntryTransformer = (entry: EntryMeta) => EntryMeta;

export function transformStoreInPlace(store: Store, transformer: EntryTransformer): void {
  if ((store as any)[Symbol.for("photon:transformed")]) return;
  (store as any)[Symbol.for("photon:transformed")] = true;

  // Intercept future modifications using Proxy
  // Transform existing entries in-place
  for (let i = 0; i < store.entries.length; i++) {
    store.entries[i] = transformer(store.entries[i]!);
  }

  // Create a proxied array
  const proxiedArray = new Proxy(store.entries, {
    get(arr, arrProp) {
      const value = arr[arrProp as any];

      // Intercept array mutation methods
      if (arrProp === "push") {
        return (...items: EntryMeta[]) => {
          return Array.prototype.push.apply(arr, items.map(transformer));
        };
      }

      if (arrProp === "unshift") {
        return (...items: EntryMeta[]) => {
          return Array.prototype.unshift.apply(arr, items.map(transformer));
        };
      }

      if (arrProp === "splice") {
        return (start: number, deleteCount?: number, ...items: EntryMeta[]) => {
          return Array.prototype.splice.apply(arr, [start, deleteCount, ...items.map(transformer)] as any);
        };
      }

      return value;
    },
    set(arr, index, value) {
      // Transform direct array assignments
      if (typeof index === "string" && !isNaN(Number(index))) {
        arr[index as any] = transformer(value);
        return true;
      }
      arr[index as any] = value;
      return true;
    },
  });

  // Replace the entries array with the proxied version
  store.entries = proxiedArray;
}
