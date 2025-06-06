/// <reference types="@photonjs/core/api" />
/* The Vite plugin cloudflare() will be replaced by this:
import cloudflare from '@photonjs/cloudflare'
*/
import { cloudflare } from '@photonjs/cloudflare/vite'
import { awesomeFramework } from 'awesome-framework/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    photon: {
      server: 'server.ts',
      /* The Vite plugin cloudflare() will be replaced by this:
      target: cloudflare, // not needed when using @photonjs/auto
      */
    },
    plugins: [
      // Will be replaced with a photon.target setting
      mode === 'cloudflare' &&
        cloudflare({
          inspectorPort: false,
        }), // not needed when using @photonjs/auto
      awesomeFramework(),
    ],
  }
})
