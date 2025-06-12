import { cloudflare as cloudflareVitePlugins, type PluginConfig } from '@cloudflare/vite-plugin'
import { getPhotonMeta } from '@photonjs/core/api'
import { supportedTargetServers } from '@photonjs/core/vite'
import type { Plugin } from 'vite'

const moduleId = 'photon:cloudflare'
const virtualModuleId = `\0${moduleId}`

// TODO: create actual virtual Target Entries for each server
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
            },
          }
        },
      },
    },
    // TODO Should this be generic for all adapters?
    {
      name: `${moduleId}:prefixer`,
      apply: 'build',
      enforce: 'post',
      configEnvironment(name, config) {
        if (config.consumer === 'server' && config.build?.rollupOptions?.input) {
          // Ensured by Photon
          const input = config.build.rollupOptions.input as Record<string, string>
          for (const key of Object.keys(input)) {
            input[key] = `${moduleId}:${input[key]}`
          }
        }
      },
    },
    supportedTargetServers('cloudflare', ['hono', 'h3']),
    {
      name: `${moduleId}:resolver`,

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

      // TODO add tests
      async load(id) {
        if (!id.startsWith(virtualModuleId)) return
        const actualId = id.slice(virtualModuleId.length + 1)
        const meta = await getPhotonMeta(this, id)
        const isDev = this.environment.config.command === 'serve'

        if (meta.type === 'server') {
          // `server` usually exists only during build time
          if (meta.server) {
            return {
              // language=ts
              code: `import serverEntry from ${JSON.stringify(actualId)};
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
              code: `import serverEntry from ${JSON.stringify(actualId)};
import { asFetch } from "@photonjs/cloudflare/dev";

export const fetch = asFetch(serverEntry, ${JSON.stringify(actualId)});
export default { fetch };
`,
              map: { mappings: '' },
            }
          }
        } else {
          return {
            // language=ts
            code: `import handler from ${JSON.stringify(actualId)};
import { getRuntime } from "photon:resolve-from-photon:@universal-middleware/cloudflare";

export const fetch = (request, env, ctx) => {
  return handler(request, {}, getRuntime(env, ctx))
};
export default { fetch };
`,
            map: { mappings: '' },
          }
        }

        return this.error(`[photon][cloudflare] Unable to load ${actualId}`)
      },

      sharedDuringBuild: true,
    },
    // FIXME do not enforce ssr env
    ...cloudflareVitePlugins({ ...config, viteEnvironment: { name: 'ssr' } }),
  ]
}
