import type { Plugin } from 'vite'
import type { Photon } from '../../types.js'
import { resolvePhotonConfig } from '../../validators/coerce.js'

export function resolvePhotonConfigPlugin(pluginConfig?: Photon.Config): Plugin[] {
  let resolvedPhotonConfig: Photon.ConfigResolved | null = null

  return [
    {
      name: 'photon:resolve-config',
      enforce: 'pre',

      config(userConfig) {
        // Custom config merging
        // TODO unit tests
        if (pluginConfig || userConfig.photon) {
          userConfig.photon ??= {}
          const resolvedUserConfig = resolvePhotonConfig(userConfig.photon)
          const resolvedPluginConfig = resolvePhotonConfig(pluginConfig)

          // server
          userConfig.photon.server = userConfig.photon?.server ? resolvedUserConfig.server : resolvedPluginConfig.server

          // handlers
          userConfig.photon.handlers = Object.assign({}, resolvedPluginConfig.handlers, resolvedUserConfig.handlers)

          // middlewares
          userConfig.photon.middlewares = []
          if (resolvedPluginConfig.middlewares) {
            userConfig.photon.middlewares.push(...resolvedPluginConfig.middlewares)
          }
          if (resolvedUserConfig.middlewares) {
            userConfig.photon.middlewares.push(...resolvedUserConfig.middlewares)
          }

          // devServer
          if (pluginConfig?.devServer) {
            userConfig.photon.devServer = resolvedPluginConfig.devServer ?? true
          }
          if (userConfig.photon.devServer === false) {
            userConfig.photon.devServer = false
          } else if (typeof resolvedUserConfig.devServer === 'object') {
            userConfig.photon.devServer =
              typeof userConfig.photon.devServer === 'boolean'
                ? resolvedUserConfig.devServer
                : { ...userConfig.photon.devServer, ...resolvedUserConfig.devServer }
          }

          // hmr
          userConfig.photon.hmr = userConfig.photon?.hmr ? resolvedUserConfig.hmr : resolvedPluginConfig.hmr

          // additionalServerConfigs
          userConfig.photon.additionalServerConfigs = []
          if (resolvedUserConfig.additionalServerConfigs) {
            userConfig.photon.additionalServerConfigs.push(...resolvedUserConfig.additionalServerConfigs)
          }
          if (resolvedPluginConfig.additionalServerConfigs) {
            userConfig.photon.additionalServerConfigs.push(...resolvedPluginConfig.additionalServerConfigs)
          }
        }
      },

      configResolved: {
        order: 'pre',
        handler(config) {
          // Ensures that a unique photon config exists across all envs
          if (resolvedPhotonConfig === null) {
            resolvedPhotonConfig = resolvePhotonConfig(config.photon)
          }
          config.photon = resolvedPhotonConfig
        },
      },
    },
  ]
}
