import type { Plugin } from "vite";

export function assertServerEntry<T>(
  entry: T,
): asserts entry is T & { fetch: (request: Request) => Response | Promise<Response> } {
  if (!entry) {
    throw new Error("Server entry must have a default export");
  }
  if (typeof entry !== "object") {
    throw new Error("Server entry default export must be an object");
  }
  if (!("fetch" in entry)) {
    throw new Error("Server entry default export must include a 'fetch' method");
  }
}

export function createParam(param: string) {
  return {
    re: new RegExp(`[?&]${param}\\b`),
    virtualRe: new RegExp(`\x00.*[?&]${param}\\b`),
    param,
  };
}

type MaybePromise<T> = T | Promise<T>;
type PluginInput = MaybePromise<Plugin | Plugin[] | false | null | undefined>;

export async function resolvePlugins(plugins: readonly PluginInput[] = []): Promise<Plugin[]> {
  const resolved: Plugin[] = [];

  for (const p of plugins) {
    if (!p) continue;

    const awaited = await p;

    if (!awaited) continue;

    if (Array.isArray(awaited)) {
      resolved.push(...(await resolvePlugins(awaited)));
    } else {
      resolved.push(awaited);
    }
  }

  return resolved;
}
