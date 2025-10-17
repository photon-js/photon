export function regexGroups<T extends object>(regex: RegExp) {
  return {
    regex,
    match(x?: string) {
      if (x === undefined) return null;
      const match = x.match(regex);
      if (match === null) return null;
      return match.groups as T;
    },
  };
}

const virtualModules = {
  "virtual-entry": regexGroups<{ uniqueId: string; entry: string }>(
    /^virtual:photon:virtual-entry:(?<uniqueId>.+?):(?<entry>.+)/,
  ),
  "handler-entry": regexGroups<{ entry: string }>(/^virtual:photon:handler-entry:(?<entry>.+)/),
  "server-entry": regexGroups<{ entry?: string }>(/^virtual:photon:server-entry(?:$|:(?<entry>.+))/),
  "server-entry-with-entry": regexGroups<{ condition: string; entry: string }>(
    /^virtual:photon:server-entry-with-entry:(?<condition>.+?):(?<entry>.+)/,
  ),
  "dynamic-entry": regexGroups<{ entry: string }>(/^virtual:photon:dynamic-entry:(?<entry>.+)/),
  "fallback-entry": regexGroups(/^virtual:photon:fallback-entry/),
  "resolve-from-photon": regexGroups<{ module: string }>(/^virtual:photon:resolve-from-photon:(?<module>.+)/),
  "get-middlewares": regexGroups<{ condition: string; server: string; handler?: string }>(
    /^virtual:photon:get-middlewares:(?<condition>.+?):(?<server>[^:]+)(?::(?<handler>.+))?/,
  ),
};

export const virtualModulesRegex = Object.fromEntries(
  Object.entries(virtualModules).map(([k, v]) => [k, v.regex]),
) as Record<keyof typeof virtualModules, RegExp>;

type VirtualModuleKeys = keyof typeof virtualModules;
type ExtractArgs<K extends VirtualModuleKeys | VirtualModuleKeys[]> = NonNullable<
  ReturnType<(typeof virtualModules)[K extends VirtualModuleKeys ? K : K[number]]["match"]>
>;

export function ifPhotonModule<
  K extends VirtualModuleKeys | VirtualModuleKeys[],
  // biome-ignore lint/suspicious/noExplicitAny: any
  F extends (arg: ExtractArgs<K>) => any,
>(key: K, value: unknown, callback: F): null | ReturnType<F>;
export function ifPhotonModule<
  K extends VirtualModuleKeys | VirtualModuleKeys[],
  // biome-ignore lint/suspicious/noExplicitAny: any
  F extends (arg: ExtractArgs<K>) => any,
  R,
>(
  key: K,
  value: unknown,
  callback: F,
  next: R,
): R extends Error
  ? ReturnType<F>
  : // biome-ignore lint/suspicious/noExplicitAny: any
    R extends (...args: any[]) => any
    ? ReturnType<R> | ReturnType<F>
    : R | ReturnType<F>;
export function ifPhotonModule<
  K extends VirtualModuleKeys | VirtualModuleKeys[],
  // biome-ignore lint/suspicious/noExplicitAny: any
  F extends (arg: ExtractArgs<K>) => any,
>(key: K, value: unknown, callback: F, next: unknown = null): unknown | ReturnType<F> {
  function returnOrThrow() {
    if (next instanceof Error) {
      throw next;
    }
    if (typeof next === "function") {
      return next();
    }

    return next;
  }

  if (Array.isArray(key)) {
    for (const k of key) {
      // biome-ignore lint/suspicious/noExplicitAny: any
      const r = ifPhotonModule(k as VirtualModuleKeys, value, callback as any);
      if (r !== null) return r;
    }
    return returnOrThrow();
  }

  // biome-ignore lint/suspicious/noExplicitAny: any
  const out = virtualModules[key as VirtualModuleKeys].match(value as any);

  if (out === null) {
    return returnOrThrow();
  }

  // biome-ignore lint/suspicious/noExplicitAny: any
  return callback(out as any);
}

export function asPhotonEntryId(id: string, type: "handler-entry" | "server-entry" | "server-config") {
  if (id.startsWith(`virtual:photon:${type}`)) {
    return id;
  }
  return `virtual:photon:${type}:${id}`;
}
