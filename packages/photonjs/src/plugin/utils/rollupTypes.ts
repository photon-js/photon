import type { Plugin } from 'vite'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type PluginContext = ThisParameterType<Extract<Plugin['resolveId'], (...args: never) => any>>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ModuleInfo = Parameters<Extract<Plugin['moduleParsed'], (...args: never) => any>>[0]

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type LoadResult = Awaited<ReturnType<Extract<Plugin['load'], (...args: never) => any>>>
