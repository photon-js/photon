import type { Plugin } from 'vite'
import type { GetPhotonCondition } from '../../validators/types.js'

export interface InstallPhotonBaseOptions {
  resolveMiddlewares?: GetPhotonCondition
}

export function installPhotonBase(name: string, options?: InstallPhotonBaseOptions): Plugin[] {
  const plugins: Plugin[] = [
    {
      name: `photon:resolve-virtual-importer:${name}`,
      enforce: 'post',

      async resolveId(id, importer, opts) {
        if (importer === 'photon:fallback-entry' || importer?.startsWith('photon:get-middlewares:')) {
          const resolved = await this.resolve(id, importer, opts)

          if (!resolved) {
            const resolvedPkg = await this.resolve(name)
            // Multiple libs can try to resolve this
            if (resolvedPkg) {
              return this.resolve(id, resolvedPkg.id, opts)
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
