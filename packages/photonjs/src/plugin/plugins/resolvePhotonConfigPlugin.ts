import type { Plugin } from 'vite'
import type { Photon } from '../../types.js'
import { PhotonConfigError } from '../../utils/assert.js'
import { resolvePhotonConfig } from '../../validators/coerce.js'
import { singleton } from '../utils/dedupe.js'

export function resolvePhotonConfigPlugin(pluginConfig?: Photon.Config): Plugin[] {
  let resolvedPhotonConfig: Photon.ConfigResolved | null = null
  const plugins: Plugin[] = [
    singleton({
      name: 'photon:resolve-config',
      enforce: 'pre',

      config: {
        order: 'pre',
        handler() {
          return {
            photon: [],
          }
        },
      },

      configResolved: {
        order: 'pre',
        handler(config) {
          // Ensures that a unique photon config exists across all envs
          if (resolvedPhotonConfig === null) {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            resolvedPhotonConfig = resolvePhotonConfig(config.photon as any)
          }
          if (resolvedPhotonConfig.codeSplitting) {
            const serverConfigEntries = resolvedPhotonConfig.entries.filter((e) => e.type === 'server-config')
            if (serverConfigEntries.length > 0) {
              throw new PhotonConfigError(
                'server-config entries are not supported when code splitting is enabled. Please disable code splitting or remove server-config entries.',
              )
            }
          }
          config.photon = resolvedPhotonConfig
        },
      },
    }),
  ]

  if (pluginConfig) {
    plugins.push({
      name: 'photon:manual-config',
      enforce: 'pre',

      config: {
        order: 'pre',
        handler() {
          return {
            photon: [pluginConfig],
          }
        },
      },
    })
  }

  return plugins
}
