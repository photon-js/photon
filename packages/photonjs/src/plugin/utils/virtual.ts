import { type Out, type Type, type } from 'arktype'
import { assert } from '../../utils/assert.js'

type ToLiteral<T extends string> = T extends `\${${infer _}}` ? string : T
// biome-ignore lint/complexity/noBannedTypes: <explanation>
type ToParse<T extends string> = T extends `\${${infer X}}` ? { [K in X]: string } : {}

type Literal<T extends string> = T extends `${infer A}:${infer B}` ? `${ToLiteral<A>}:${Literal<B>}` : ToLiteral<T>
type Parse<T extends string> = T extends `${infer A}:${infer B}` ? ToParse<A> & Parse<B> : ToParse<T>

export function literal<const T extends string>(pattern: T) {
  const regex = new RegExp(`^${pattern.replace(/\$\{(.*?)}/g, '(?<$1>.*)')}\$`)
  return type(regex)
    .configure({ expected: pattern })
    .pipe.try((x) => {
      const match = x.match(regex)
      assert(match)
      return match.groups as Parse<T>
      // biome-ignore lint/complexity/noBannedTypes: <explanation>
    }) as Type<(In: Literal<T>) => Out<Parse<T>>, {}>
}

export const virtualModules = {
  'handler-entry': literal('photon:handler-entry:${entry}'),
  'server-entry': literal('photon:server-entry:${entry}'),
  'fallback-entry': literal('photon:fallback-entry'),
  'resolve-from-photon': literal('photon:resolve-from-photon:${module}'),
  'get-middlewares': literal('photon:get-middlewares:${condition}:${server}'),
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
