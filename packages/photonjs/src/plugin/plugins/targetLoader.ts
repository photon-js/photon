import type { Plugin } from 'vite'
import { getPhotonMeta } from '../../utils/meta.js'
import type { PhotonMeta } from '../utils/entry.js'
import { escapeStringRegexp } from "../utils/escapeStringRegexp.js";
import type { LoadResult, PluginContext } from '../utils/rollupTypes.js'

type LoadHook = (
  this: PluginContext,
  id: string,
  options: {
    meta: PhotonMeta
    ssr?: boolean
  },
) => Promise<LoadResult> | LoadResult

export function targetLoader(name: string, loadPlugin: { load: LoadHook }): Plugin[] {
  const prefix = `photon:${name}`
  const re_prefix = new RegExp(`^${escapeStringRegexp(prefix)}:`)

  return [
    {
      name: `photon:target-loader:${name}:prefixer`,

      apply: 'build',
      enforce: 'post',
      configEnvironment(_name, config) {
        if (config.consumer === 'server' && config.build?.rollupOptions?.input) {
          // Ensured by Photon
          const input = config.build.rollupOptions.input as Record<string, string>
          for (const key of Object.keys(input)) {
            input[key] = `${prefix}:${input[key]}`
          }
        }
      },

      sharedDuringBuild: true,
    },
    {
      name: `photon:target-loader:${name}:loader`,

      resolveId: {
        filter: {
          id: re_prefix,
        },

        async handler(id, importer, opts) {
          const resolved = await this.resolve(id.replace(re_prefix, ''), importer, opts)

          if (!resolved) {
            return this.error(`[photon][${name}] Cannot resolve ${id}`)
          }

          return {
            ...resolved,
            id: `${prefix}:${resolved.id}`,
          }
        },
      },

      load: {
        filter: {
          id: re_prefix,
        },

        async handler(id, opts) {
          const actualId = id.slice(prefix.length + 1)
          const meta = await getPhotonMeta(this, id)
          return loadPlugin.load.call(this, actualId, {
            ...opts,
            meta,
          })
        },
      },

      sharedDuringBuild: true,
    },
  ]
}
