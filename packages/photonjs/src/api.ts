/// <reference types="vite" />
import type { Photon } from './types.js'

export { isPhotonMeta, type PhotonMeta } from './plugin/utils/entry.js'
export { resolvePhotonConfig } from './validators/coerce.js'
export { setPhotonHandler, getPhotonServerIdWithHandler } from './api/api.js'
export {
  PhotonError,
  PhotonBugError,
  PhotonUsageError,
  PhotonConfigError,
  PhotonRuntimeError,
  PhotonDependencyError,
} from './utils/assert.js'
export { getPhotonMeta } from './utils/meta.js'
export type { Photon }

declare module 'vite' {
  interface UserConfig {
    photon?: Photon.Config
  }

  interface ResolvedConfig {
    photon: Photon.ConfigResolved
  }
}
