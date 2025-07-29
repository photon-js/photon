import type { Plugin } from 'vite'
import { getPhotonServerIdWithEntry } from '../../api/api.js'
import type { Photon } from '../../types.js'
import { getPhotonMeta } from '../../utils/meta.js'
import { escapeStringRegexp } from '../utils/escapeStringRegexp.js'
import type { LoadResult, PluginContext } from '../utils/rollupTypes.js'

type LoadHook = (
  this: PluginContext,
  id: string,
  options: {
    meta: Photon.EntryServer
    ssr?: boolean
  },
) => Promise<LoadResult> | LoadResult

export function targetLoader(name: string, options: { load: LoadHook }): Plugin[] {
  const prefix = `photon:${name}`
  const re_prefix = new RegExp(`^${escapeStringRegexp(prefix)}:`)

  return [
    {
      name: `photon:target-loader:${name}:emit`,

      apply: 'build',
      enforce: 'post',

      buildStart: {
        order: 'post',
        handler() {
          const envName = this.environment.name
          const photon = this.environment.config.photon
          const isEdge = this.environment.config.resolve.conditions.some((x) =>
            ['edge-light', 'worker', 'workerd', 'edge'].includes(x),
          )

          if (photon.defaultBuildEnv === envName) {
            this.emitFile({
              type: 'chunk',
              fileName: photon.server.target || photon.server.name,
              id: `${prefix}:${photon.server.id}`,
            })
          }

          if (photon.codeSplitting) {
            // Emit handlers, each wrapped behind the server entry
            for (const entry of photon.entries) {
              if ((entry.env || 'ssr') === envName) {
                this.emitFile({
                  type: 'chunk',
                  fileName: entry.target || entry.name,
                  // TODO simplify this
                  id: `${prefix}:${getPhotonServerIdWithEntry(isEdge ? 'edge' : 'node', entry.name)}`,
                })
              }
            }
          }
        },
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
            // tag module as target entry for other plugins to use
            photonConfig: {
              isTargetEntry: true,
            },
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
          // At this point, all handlers are wrapped with the server entry, so the entry type is always "server"
          const meta = (await getPhotonMeta(this, id)) as Photon.EntryServer
          return options.load.call(this, actualId, {
            ...opts,
            meta,
          })
        },
      },

      sharedDuringBuild: true,
    },
  ]
}
