import type { PluginContext } from 'rollup'
import type { Nullable } from 'unplugin'

interface Opts {
  source: Parameters<PluginContext['resolve']>[0]
  importer?: Parameters<PluginContext['resolve']>[1]
  opts?: Parameters<PluginContext['resolve']>[2]
}

export async function resolveFirst(pluginContext: PluginContext, tryToResolve: Nullable<Opts>[]) {
  const resolving = await Promise.all(
    (tryToResolve.filter(Boolean) as Opts[]).map(({ source, importer, opts }) =>
      pluginContext.resolve(source, importer, opts),
    ),
  )

  return resolving.find((r) => Boolean(r))
}
