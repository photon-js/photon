/// <reference types="@photonjs/core/api" />
import { cloudflare as cloudflareVitePlugins, type PluginConfig } from '@cloudflare/vite-plugin'
import { isPhotonMeta } from '@photonjs/core/api'
import type { Plugin } from 'vite'

const moduleId = 'photon:cloudflare'
const virtualModuleId = `\0${moduleId}`

// TODO: create actual virtual Target Entries for each server
export function cloudflare(config?: Omit<PluginConfig, 'viteEnvironment'>): Plugin[] {
  return [
    {
      name: 'photon:cloudflare',
      enforce: 'pre',
      config: {
        handler() {
          return {
            photon: {
              // @cloudflare/vite-plugin has its own dev server
              devServer: false,
            },
          }
        },
      },
    },
    {
      name: 'photon:cloudflare-resolver',

      async resolveId(id, importer, opts) {
        if (id.startsWith(moduleId)) {
          const resolved = await this.resolve(id.replace(/^photon:cloudflare:/, ''), importer, opts)

          if (!resolved) {
            return this.error(`[photon][cloudflare] Cannot resolve ${id}`)
          }

          return {
            ...resolved,
            id: `${virtualModuleId}:${resolved.id}`,
          }
        }
      },

      async load(id) {
        if (!id.startsWith(virtualModuleId)) return

        const actualId = id.slice(virtualModuleId.length + 1)

        const info = this.getModuleInfo(id)

        if (!isPhotonMeta(info?.meta)) {
          return this.error(`[photon][cloudflare] ${actualId} is not a Photon entry`)
        }

        // `server.server` exists only during build time
        if (info.meta.photon.type === 'server' && info.meta.photon.server === 'hono') {
          return {
            // TODO handle all server types
            // language=ts
            code: `import serverEntry from ${JSON.stringify(this.environment.config.photon.server.id)};

export const fetch = serverEntry.fetch;
export default { fetch };
`,
            map: { mappings: '' },
          }
        }
        // TODO handle other servers
        // TODO for dev, the server needs to be set by serve or apply during runtime
        //  this can be achieved via a symbol attached to the app itself

        throw new Error('Not implemented')
      },
    },
    ...cloudflareVitePlugins({ ...config, viteEnvironment: { name: 'ssr' } }),
  ]
}
