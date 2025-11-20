import type { Plugin } from "vite";

// biome-ignore lint/suspicious/noExplicitAny: any
export type PluginContext = ThisParameterType<Extract<Plugin["resolveId"], (...args: never) => any>>;

// biome-ignore lint/suspicious/noExplicitAny: any
export type ModuleInfo = Parameters<Extract<Plugin["moduleParsed"], (...args: never) => any>>[0];

// biome-ignore lint/suspicious/noExplicitAny: any
export type LoadResult = Awaited<ReturnType<Extract<Plugin["load"], (...args: never) => any>>>;

export type ResolvedId = Awaited<ReturnType<PluginContext["resolve"]>>;
