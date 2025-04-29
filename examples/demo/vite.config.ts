import { cloudflare } from '@photonjs/cloudflare/vite'
import { photonjs } from '@photonjs/core/plugin'
import { defineConfig, type Plugin } from 'vite'
import { simpleFrameworkPlugin } from './framework/vite-plugin.js'
import { render } from './src/entry-server.js'

export default defineConfig(({ mode }) => {
  return {
    appType: 'custom',
    plugins: [
      mode === 'cloudflare' ? cloudflare() : undefined,
      photonjs({
        entry: 'server.ts',
      }),
      simpleFrameworkPlugin(render),
    ] as Plugin[],
  }
})
