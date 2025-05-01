import 'vite'
import './types.js'

export { isPhotonMeta, type PhotonMeta } from './plugin/utils/entry.js'
export { resolvePhotonConfig } from './validators/coerce.js'
export { setPhotonEntry } from './api/setPhotonEntry.js'

declare module 'vite' {
  interface UserConfig {
    photon?: Photon.Config
  }

  interface ResolvedConfig {
    photon: Photon.ConfigResolved
  }
}
