import type { Plugin } from 'vite'
import type { GetPhotonCondition } from '../../validators/types.js'

export interface InstallPhotonBaseOptions {
  resolveMiddlewares?: GetPhotonCondition
}

export function installPhotonBase(name: string, options?: InstallPhotonBaseOptions): Plugin[] {
  const plugins: Plugin[] = [
    // Vite node modules resolution is not on par with node, so we have to help it resolve some modules
    {
      name: `photon:resolve-virtual-importer:${name}`,
      enforce: 'post',

      async resolveId(id, importer, opts) {
        if (
          importer === 'photon:fallback-entry' ||
          importer?.startsWith('photon:get-middlewares:') ||
          id.startsWith('@universal-middleware')
        ) {
          // first, try basic resolve
          let resolved = await this.resolve(id, importer, opts)

          if (resolved) {
            return resolved
          }

          const resolvedPkg = await this.resolve(name)
          // Multiple libs can try to resolve this
          if (resolvedPkg) {
            // next, try to resolve from `name`
            resolved = await this.resolve(id, resolvedPkg.id, opts)

            if (resolved) {
              return resolved
            }

            const resolving = await Promise.all([
              this.resolve('@photonjs/core', undefined, opts),
              this.resolve('@photonjs/core', resolvedPkg.id, opts),
            ])

            const foundPhotonCore = resolving.find((r) => Boolean(r))

            if (foundPhotonCore) {
              // lastly, try to resolve from @photonjs/core
              resolved = await this.resolve(id, foundPhotonCore.id, opts)
            }

            if (resolved) {
              return resolved
            }
          }
        }
      },
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
