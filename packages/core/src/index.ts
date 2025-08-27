import type { Photon } from "./types.js";

export * as api from "./api.js";
export type { Photon } from "./types.js";
export {
  PhotonBugError,
  PhotonConfigError,
  PhotonDependencyError,
  PhotonError,
  PhotonRuntimeError,
  PhotonUsageError,
} from "./utils/assert.js";

declare module "vite" {
  interface UserConfig {
    photon?: Photon.Config | Photon.Config[];
    afterBuildStart?: boolean;
  }

  interface ResolvedConfig {
    photon: Photon.ConfigResolved;
  }
}
