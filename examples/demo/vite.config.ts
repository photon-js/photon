import { cloudflare } from '@cloudflare/vite-plugin'
import { photonjs } from '@photonjs/core/plugin'
import { defineConfig, type Plugin } from 'vite'
import { simpleFrameworkPlugin } from './framework/vite-plugin.js'
import { render } from './src/entry-server.js'

export default defineConfig(({ mode }) => {
  return {
    appType: 'custom',
    plugins: [
      mode === 'cloudflare' ? cloudflare({ viteEnvironment: { name: 'ssr' } }) : undefined,
      photonjs({
        entry: 'server.ts',
        // FIXME will be automatically configured by @photonjs/cloudflare
        devServer: mode === 'cloudflare' ? false : {},
      }),
      simpleFrameworkPlugin(render),
    ] as Plugin[],
  }
})
