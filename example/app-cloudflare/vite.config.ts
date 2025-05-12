/* The Vite plugin cloudflare() will be replaced by this:
import cloudflare from '@photonjs/cloudflare'
*/
import { cloudflare } from '@photonjs/cloudflare/vite'
import { awesomeFramework } from 'awesome-framework/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    photon: {
      // No photon index entry is defined, it will fallback to a virtual entry
      entry: {
        // foo entry declares its route with `enhance` directly inside the file
        foo: {
          id: 'src/middlewares/foo.ts',
        },
        // bar entry route is declared here, and `enhance` is not used
        bar: {
          id: 'src/middlewares/bar.ts',
          route: '/bar',
        },
      },
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
