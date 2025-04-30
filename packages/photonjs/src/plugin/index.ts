import type { Plugin } from 'vite'
import { commonConfig } from './plugins/commonConfig.js'
import { devServer } from './plugins/devServer.js'
import { fallback } from './plugins/fallback.js'
import { getMiddlewaresPlugin } from './plugins/getMiddlewaresPlugin.js'
import { photonEntry } from './plugins/photonEntry.js'
import { resolvePhotonConfigPlugin } from './plugins/resolvePhotonConfigPlugin.js'
import '../types.js'

export { photon, photon as default }

function photon(config?: Photon.Config): Plugin[] {
  return [
    ...commonConfig(),
    resolvePhotonConfigPlugin(config),
    ...photonEntry(),
    fallback(),
    devServer(config),
    ...getMiddlewaresPlugin(),
  ]
}
