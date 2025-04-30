import { cloudflare } from '@photonjs/cloudflare/vite'
import { photon } from '@photonjs/core/vite'
import { awesomeFramework } from 'awesome-framework/vite'
import { defineConfig, type Plugin } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      // Define Photon entries
      photon({
        entry: {
          index: 'server.ts',
        },
      }),
      // Use Photon's Cloudflare adapter. @photonjs/auto will take care of this more properly in the future
      mode === 'cloudflare' ? cloudflare() : undefined,
      // Basic SSR framework
      awesomeFramework(),
    ] as Plugin[],
  }
})
