import { cloudflare } from '@photonjs/cloudflare/vite'
import { photonjs } from '@photonjs/core/plugin'
import { defineConfig, type Plugin } from 'vite'
import { simpleFrameworkPlugin } from './framework/vite-plugin.js'
import { render } from './src/entry-server.js'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      // Define Photon entries
      photonjs({
        entry: {
          index: 'server.ts',
        },
      }),
      // Use Photon's Cloudflare adapter. @photonjs/auto will take care of this more properly in the future
      mode === 'cloudflare' ? cloudflare() : undefined,
      // Basic SSR framework
      simpleFrameworkPlugin(render),
    ] as Plugin[],
  }
})
