import './vite-types.js'

export { isPhotonMeta, type PhotonMeta } from './plugin/utils/entry.js'
export { resolvePhotonConfig } from './validators/coerce.js'
export { addPhotonHandler, addPhotonServerConfig, getPhotonServerIdWithHandler } from './api/api.js'
export {
  PhotonError,
  PhotonBugError,
  PhotonUsageError,
  PhotonConfigError,
  PhotonRuntimeError,
  PhotonDependencyError,
} from './utils/assert.js'
export { getPhotonMeta } from './utils/meta.js'
