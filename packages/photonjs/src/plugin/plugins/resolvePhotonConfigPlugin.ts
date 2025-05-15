import type { Plugin } from 'vite'
import { resolvePhotonConfig } from '../../validators/coerce.js'

export function resolvePhotonConfigPlugin(userConfig?: Photon.Config): Plugin {
  return {
    name: 'photon:resolve-config',
    enforce: 'pre',

    config() {
      if (userConfig) {
        return {
          photon: resolvePhotonConfig(userConfig),
        }
      }
    },

    configResolved: {
      order: 'pre',
      handler(config) {
        config.photon = resolvePhotonConfig(config.photon)
      },
    },
  }
}
