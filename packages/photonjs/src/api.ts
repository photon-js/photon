import 'vite'
import './types.js'

export { isPhotonMeta, type PhotonMeta } from './plugin/utils/entry.js'
export { resolvePhotonConfig } from './validators/coerce.js'
export { installPhoton } from './plugin/plugins/installPhoton.js'
export { setPhotonEntry } from './api/setPhotonEntry.js'

declare module 'vite' {
  interface UserConfig {
    photonjs?: Photon.Config
  }

  interface ResolvedConfig {
    photonjs: Photon.ConfigResolved
  }
}
