import type { Photon } from "./types.js";

export {
  addPhotonEntry,
  getPhotonServerIdWithEntry,
  updatePhotonEntry,
} from "./api/api.js";
export { isPhotonMeta, type PhotonMeta } from "./plugin/utils/entry.js";
export {
  PhotonBugError,
  PhotonConfigError,
  PhotonDependencyError,
  PhotonError,
  PhotonRuntimeError,
  PhotonUsageError,
} from "./utils/assert.js";
export { getPhotonMeta } from "./utils/meta.js";
export { resolvePhotonConfig } from "./validators/coerce.js";

declare module "vite" {
  interface UserConfig {
    photon?: Photon.Config | Photon.Config[];
    afterBuildStart?: boolean;
  }

  interface ResolvedConfig {
    photon: Photon.ConfigResolved;
  }
}
