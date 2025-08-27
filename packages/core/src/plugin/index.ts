import type { Plugin } from "vite";
import type { Photon } from "../types.js";
import { commonConfig } from "./plugins/commonConfig.js";
import { devServer } from "./plugins/devServer.js";
import { getMiddlewaresPlugin } from "./plugins/getMiddlewaresPlugin.js";
import { type InstallPhotonBaseOptions, installPhotonBase } from "./plugins/installPhoton.js";
import { mirrorMeta } from "./plugins/mirrorMeta.js";
import { photonEntry } from "./plugins/photonEntry.js";
import { resolvePhotonConfigPlugin } from "./plugins/resolvePhotonConfigPlugin.js";
import { supportedTargetServers } from "./plugins/supportedServers.js";
import { targetLoader } from "./plugins/targetLoader.js";

export { photon, installPhoton, supportedTargetServers, targetLoader, type InstallPhotonOptions, photon as default };

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

interface InstallPhotonOptions {
  fullInstall?: boolean;
}

// TODO divide into more specific helpers (split across core and runtime)
function installPhoton(
  name: string,
  options?: InstallPhotonBaseOptions & InstallPhotonOptions & Photon.Config,
): Plugin[] {
  const plugins: Plugin[] = [];
  if (options?.fullInstall) {
    plugins.push(...photon(options));
  }
  plugins.push(...installPhotonBase(name, options));

  return plugins;
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
