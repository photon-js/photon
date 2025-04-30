import type { Plugin } from 'vite'
import photon from '../index.js'

export type GetPhotonCondition = (condition: 'dev' | 'edge' | 'node', server: string) => string

export interface InstallPhotonOptions {
  resolveMiddlewares?: GetPhotonCondition
}

export function installPhoton(name: string, options?: InstallPhotonOptions & Photon.Config): Plugin[] {
  const plugins: Plugin[] = [
    ...photon(options),
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
