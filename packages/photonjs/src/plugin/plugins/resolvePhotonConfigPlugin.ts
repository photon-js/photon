import type { Plugin } from 'vite'
import { resolvePhotonConfig } from '../../validators/coerce.js'

export function resolvePhotonConfigPlugin(pluginConfig?: Photon.Config): Plugin[] {
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
          userConfig.photon.middlewares ??= []
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
        }
      },

      configResolved: {
        order: 'pre',
        handler(config) {
          console.log(config.photon, resolvePhotonConfig(config.photon))
          config.photon = resolvePhotonConfig(config.photon)
        },
      },
    },
  ]
}
