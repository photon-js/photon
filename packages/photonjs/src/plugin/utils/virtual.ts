import { type Out, type Type, type } from 'arktype'
import { assert } from '../../utils/assert.js'

export function literal<T extends object>(regex: RegExp) {
  return type(regex).pipe.try((x) => {
    const match = x.match(regex)
    assert(match)
    return match.groups as T
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
  }) as Type<(In: string) => Out<T>, {}>
}

export const virtualModules = {
  'handler-entry': literal<{ entry: string }>(/^photon:handler-entry:(?<entry>.+)/),
  'server-entry': literal<{ entry?: string }>(/^photon:server-entry(?:$|:(?<entry>.+))/),
  'server-entry-with-handler': literal<{ condition: string; handler: string }>(
    /^photon:server-entry-with-handler:(?<condition>.+?):(?<handler>.+)/,
  ),
  'fallback-entry': literal(/^photon:fallback-entry/),
  'resolve-from-photon': literal<{ module: string }>(/^photon:resolve-from-photon:(?<module>.+)/),
  'get-middlewares': literal<{ condition: string; server: string }>(
    /^photon:get-middlewares:(?<condition>.+?):(?<server>.+)/,
  ),
  'virtual-apply-handler': literal<{ condition: string; server: string; handler: string }>(
    /^photon:virtual-apply-handler:(?<condition>.+?):(?<server>.+?):(?<handler>.+)/,
  ),
}

type VirtualModuleKeys = keyof typeof virtualModules

export function ifPhotonModule<
  K extends VirtualModuleKeys | VirtualModuleKeys[],
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  F extends (arg: (typeof virtualModules)[K extends VirtualModuleKeys ? K : K[number]]['infer']) => any,
>(key: K, value: unknown, callback: F): null | ReturnType<F>
export function ifPhotonModule<
  K extends VirtualModuleKeys | VirtualModuleKeys[],
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  F extends (arg: (typeof virtualModules)[K extends VirtualModuleKeys ? K : K[number]]['infer']) => any,
  R,
>(
  key: K,
  value: unknown,
  callback: F,
  next: R,
): R extends Error
  ? ReturnType<F>
  : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    R extends (...args: any[]) => any
    ? ReturnType<R> | ReturnType<F>
    : R | ReturnType<F>
export function ifPhotonModule<
  K extends VirtualModuleKeys | VirtualModuleKeys[],
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  F extends (arg: (typeof virtualModules)[K extends VirtualModuleKeys ? K : K[number]]['infer']) => any,
>(key: K, value: unknown, callback: F, next: unknown = null): unknown | ReturnType<F> {
  function returnOrThrow() {
    if (next instanceof Error) {
      throw next
    }
    if (typeof next === 'function') {
      return next()
    }

    return next
  }

  if (Array.isArray(key)) {
    for (const k of key) {
      const r = ifPhotonModule(k as VirtualModuleKeys, value, callback)
      if (r !== null) return r
    }
    return returnOrThrow()
  }

  const out = virtualModules[key as VirtualModuleKeys](value)

  if (out instanceof type.errors) {
    return returnOrThrow()
  }

  return callback(out)
}

export function asPhotonEntryId(id: string, type: 'handler-entry' | 'server-entry') {
  if (id.startsWith(`photon:${type}`)) {
    return id
  }
  return `photon:${type}:${id}`
}
