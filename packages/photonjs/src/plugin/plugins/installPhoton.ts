import type { CustomPluginOptions, PluginContext, ResolvedId } from 'rollup'
import type { Plugin } from 'vite'
import type { GetPhotonCondition } from '../../validators/types.js'
import { resolveFirst } from '../utils/resolve.js'
import { ifPhotonModule } from '../utils/virtual.js'

export interface InstallPhotonBaseOptions {
  resolveMiddlewares?: GetPhotonCondition
}

export function installPhotonBase(name: string, options?: InstallPhotonBaseOptions): Plugin[] {
  let resolvedName: ResolvedId | null | undefined = undefined

  function photonVirtualModuleResolver(
    id: string,
    importer?: string,
    opts?: {
      attributes?: Record<string, string>
      custom?: CustomPluginOptions
      isEntry?: boolean
      skipSelf?: boolean
    },
  ) {
    return async function resolvePhotonVirtualModule(this: PluginContext) {
      // first, try basic resolve
      let resolved = await this.resolve(id, importer, opts)

      if (resolved) {
        return resolved
      }

      resolvedName ??= await resolveFirst(this, [
        { source: name, importer: undefined },
        { source: name, importer },
      ])

      // Multiple libs can try to resolve this
      if (resolvedName) {
        // next, try to resolve from `name`
        resolved = await this.resolve(id, resolvedName.id, opts)

        if (resolved) {
          return resolved
        }
      }

      // finally, fallback to finding photon and trying to resolve from there
      return this.resolve(`photon:resolve-from-photon:${id}`, importer, {
        ...opts,
        custom: {
          ...opts?.custom,
          photonScope: name,
        },
      })
    }
  }

  const plugins: Plugin[] = [
    // Vite node modules resolution is not on par with node, so we have to help it resolve some modules
    {
      name: `photon:resolve-from-photon:${name}`,
      enforce: 'pre',

      async resolveId(id, importer, opts) {
        return ifPhotonModule('resolve-from-photon', id, async ({ module: actualId }) => {
          if (opts.custom?.photonScope !== undefined && opts.custom.photonScope !== name) return

          resolvedName ??= await resolveFirst(this, [
            { source: name, importer: undefined },
            { source: name, importer },
          ])

          const foundPhotonCore = await resolveFirst(this, [
            { source: '@photonjs/core', importer: undefined, opts },
            resolvedName ? { source: '@photonjs/core', importer: resolvedName.id, opts } : undefined,
          ])

          if (foundPhotonCore) {
            return this.resolve(actualId, foundPhotonCore.id, opts)
          }
        })
      },

      sharedDuringBuild: true,
    },
    {
      name: `photon:resolve-virtual-module:${name}`,

      async resolveId(id, importer, opts) {
        return ifPhotonModule(
          ['fallback-entry', 'get-middlewares'],
          id,
          photonVirtualModuleResolver(id, importer, opts).bind(this),
        )
      },

      sharedDuringBuild: true,
    },
    {
      name: `photon:resolve-virtual-importer:${name}`,

      async resolveId(id, importer, opts) {
        return ifPhotonModule(
          ['fallback-entry', 'get-middlewares'],
          importer,
          photonVirtualModuleResolver(id, importer, opts).bind(this),
        )
      },

      sharedDuringBuild: true,
    },
  ]

  if (options?.resolveMiddlewares) {
    plugins.push({
      name: `photon:define-middlewares:${name}`,
      config() {
        if (options?.resolveMiddlewares) {
          return {
            photon: {
              middlewares: [options.resolveMiddlewares],
            },
          }
        }
      },
    })
  }

  return plugins
}
