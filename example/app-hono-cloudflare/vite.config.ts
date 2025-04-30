import { cloudflare } from '@photonjs/cloudflare/vite'
import { awesomeFramework } from 'awesome-framework/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    photon: {
      entry: {
        index: 'server.ts',
      },
    },
    plugins: [
      // Not needed when using @photonjs/auto
      mode === 'cloudflare' && cloudflare(),
      awesomeFramework(),
    ],
  }
})
