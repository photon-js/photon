/// <reference types="@photonjs/core/api" />
import { cloudflare as cloudflareVitePlugins } from '@cloudflare/vite-plugin'
import type { Plugin } from 'vite'

export function cloudflare(): Plugin[] {
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
    ...cloudflareVitePlugins({ viteEnvironment: { name: 'ssr' } }),
  ]
}
