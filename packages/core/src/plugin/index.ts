import type { Plugin } from "vite";
import type { Photon } from "../types.js";
import { commonConfig } from "./plugins/commonConfig.js";
import { devServer } from "./plugins/devServer.js";
import { getMiddlewaresPlugin } from "./plugins/getMiddlewaresPlugin.js";
import { type InstallPhotonBaseOptions, installPhotonResolver } from "./plugins/installPhoton.js";
import { mirrorMeta } from "./plugins/mirrorMeta.js";
import { photonEntry } from "./plugins/photonEntry.js";
import { resolvePhotonConfigPlugin } from "./plugins/resolvePhotonConfigPlugin.js";
import { supportedTargetServers } from "./plugins/supportedServers.js";
import { targetLoader } from "./plugins/targetLoader.js";

export {
  photon,
  installPhotonCore,
  installPhotonResolver,
  supportedTargetServers,
  targetLoader,
  type InstallPhotonCoreOptions,
  photon as default,
};

function photon(config?: Photon.Config): Plugin[] {
  return [
    ...commonConfig(),
    ...resolvePhotonConfigPlugin(config),
    ...photonEntry(),
    ...mirrorMeta(),

    devServer(config),
    ...getMiddlewaresPlugin(),
  ];
}

type InstallPhotonCoreOptions = InstallPhotonBaseOptions & Photon.Config;

function installPhotonCore(name: string, options?: InstallPhotonCoreOptions): Plugin[] {
  return [...photon(options), ...installPhotonResolver(name, options)];
}

declare module "vite" {
  interface UserConfig {
    photon?: Photon.Config | Photon.Config[];
    afterBuildStart?: boolean;
  }

  interface ResolvedConfig {
    photon: Photon.ConfigResolved;
  }
}
