import { type Out, type Type, type } from 'arktype'

type ToLiteral<T extends string> = T extends `\${${infer _}}` ? string : T
// biome-ignore lint/complexity/noBannedTypes: <explanation>
type ToParse<T extends string> = T extends `\${${infer X}}` ? { [K in X]: string } : {}

type Literal<T extends string> = T extends `${infer A}:${infer B}` ? `${ToLiteral<A>}:${Literal<B>}` : ToLiteral<T>
type Parse<T extends string> = T extends `${infer A}:${infer B}` ? ToParse<A> & Parse<B> : ToParse<T>

export function literal<const T extends string>(pattern: T) {
  const regex = new RegExp(`^${pattern.replace(/\$\{(.*?)}/g, '(?<$1>[^:]*)')}\$`, 'g')
  return type(regex)
    .configure({ expected: pattern })
    .pipe.try((x) => {
      // biome-ignore lint/style/noNonNullAssertion: already validated by type
      const match = x.match(regex)!
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
>(key: K, value: unknown, callback: F, returnValue: R): R extends Error ? ReturnType<F> : R | ReturnType<F>
export function ifPhotonModule<
  K extends VirtualModuleKeys | VirtualModuleKeys[],
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  F extends (arg: (typeof virtualModules)[K extends VirtualModuleKeys ? K : K[number]]['infer']) => any,
>(key: K, value: unknown, callback: F, returnValue?: unknown): unknown | ReturnType<F> {
  if (Array.isArray(key)) {
    for (const k of key) {
      const r = ifPhotonModule(k as VirtualModuleKeys, value, callback)
      if (r !== null) return r
    }
    if (returnValue instanceof Error) {
      throw returnValue
    }

    return returnValue
  }

  const out = virtualModules[key as VirtualModuleKeys](value)

  if (out instanceof type.errors) {
    if (returnValue instanceof Error) {
      throw returnValue
    }

    return returnValue
  }

  return callback(out)
}

export function asPhotonEntryId(id: string, type: 'handler-entry' | 'server-entry') {
  if (id.startsWith(`photon:${type}`)) {
    return id
  }
  return `photon:${type}:${id}`
}
