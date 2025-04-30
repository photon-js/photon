import { cloudflare } from '@photonjs/cloudflare/vite'
import { awesomeFramework } from 'awesome-framework/vite'
import { defineConfig, type Plugin } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    photonjs: {
      // Define Photon entries
      entry: {
        index: 'server.ts',
      },
    },
    plugins: [
      // Use Photon's Cloudflare adapter. @photonjs/auto will take care of this more properly in the future
      mode === 'cloudflare' ? cloudflare() : undefined,
      // SSR framework using PhotonJS
      ...awesomeFramework(),
    ] as Plugin[],
  }
})
