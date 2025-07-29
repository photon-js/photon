import { cloudflare as cloudflareVitePlugins, type PluginConfig } from '@cloudflare/vite-plugin'
import { supportedTargetServers, targetLoader } from '@photonjs/core/vite'
import type { Plugin } from 'vite'

const moduleId = 'photon:cloudflare'

export function cloudflare(config?: Omit<PluginConfig, 'viteEnvironment'>): Plugin[] {
  return [
    {
      name: `${moduleId}:config`,
      enforce: 'pre',
      config: {
        handler() {
          return {
            photon: {
              // @cloudflare/vite-plugin has its own dev server
              devServer: false,
              codeSplitting: false,
              // Should be set to the value of cloudflareVitePlugins -> viteEnvironment.name
              // defaultBuildEnv: 'cloudflare',
            },
          }
        },
      },
    },
    ...targetLoader('cloudflare', {
      async load(id, { meta }) {
        const isDev = this.environment.config.command === 'serve'

        // `server` usually exists only during build time
        if (meta.server) {
          return {
            // language=ts
            code: `import serverEntry from ${JSON.stringify(id)};
            import { asFetch } from "@photonjs/cloudflare/${meta.server}";

            export const fetch = asFetch(serverEntry);
            export default { fetch };
            `,
            map: { mappings: '' },
          }
        }

        if (isDev) {
          return {
            // language=ts
            code: `import serverEntry from ${JSON.stringify(id)};
import { asFetch } from "@photonjs/cloudflare/dev";

export const fetch = asFetch(serverEntry, ${JSON.stringify(id)});
export default { fetch };
`,
            map: { mappings: '' },
          }
        }

        return this.error(`[photon][cloudflare] Unable to load ${id}`)
      },
    }),
    supportedTargetServers('cloudflare', ['hono', 'h3']),
    // FIXME do not enforce ssr env?
    ...cloudflareVitePlugins({ ...config, viteEnvironment: { name: 'ssr' } }),
  ]
}
