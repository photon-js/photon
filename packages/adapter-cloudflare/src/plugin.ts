/// <reference types="@photonjs/core/api" />
import { cloudflare as cloudflareVitePlugins, type PluginConfig } from '@cloudflare/vite-plugin'
import type { Plugin } from 'vite'

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

      resolveId(id) {
        if (id.startsWith('photon:cloudflare')) {
          return id
        }
      },

      async load(id) {
        if (!id.startsWith('photon:cloudflare')) return

        // FIXME photon:server-entry should be resolved by @photonjs/core
        if (id.replace('photon:cloudflare:', '') !== 'photon:server-entry') {
          throw new Error('Not implemented')
        }

        // `server.server` exists only during build time
        if (this.environment.config.photon.server.server === 'hono') {
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
