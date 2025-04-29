/// <reference types="@photonjs/core/api" />
import { cloudflare as cloudflareVitePlugins, type PluginConfig } from '@cloudflare/vite-plugin'
import type { Plugin } from 'vite'

export function cloudflare(config?: Omit<PluginConfig, 'viteEnvironment'>): Plugin[] {
  return [
    {
      name: 'photonjs:cloudflare',
      enforce: 'pre',
      config: {
        handler() {
          return {
            photonjs: {
              // @cloudflare/vite-plugin has its own dev server
              devServer: false,
            },
          }
        },
      },
    },
    ...cloudflareVitePlugins({ ...config, viteEnvironment: { name: 'ssr' } }),
  ]
}
