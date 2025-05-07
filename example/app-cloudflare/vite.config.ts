/* The Vite plugin cloudflare() will be replaced by this:
import cloudflare from '@photonjs/cloudflare'
*/
import { cloudflare } from '@photonjs/cloudflare/vite'
import { awesomeFramework } from 'awesome-framework/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  // No photon entry is defined, it will fallback to a virtual entry
  return {
    plugins: [
      // Will be replaced with a photon.target setting
      mode === 'cloudflare' && cloudflare(), // not needed when using @photonjs/auto
      awesomeFramework(),
    ],
  }
})
