import type { Plugin } from "vite";
import { commonConfig } from "./plugins/commonConfig.js";
import { devServer } from "./plugins/devServer.js";
import { fallback } from "./plugins/fallback.js";
import { getMiddlewaresPlugin } from "./plugins/getMiddlewaresPlugin.js";
import { installPhotonBase, type InstallPhotonBaseOptions } from "./plugins/installPhoton.js";
import { mirrorMeta } from "./plugins/mirrorMeta.js";
import { photonEntry } from "./plugins/photonEntry.js";
import { resolvePhotonConfigPlugin } from "./plugins/resolvePhotonConfigPlugin.js";
import { supportedTargetServers } from "./plugins/supportedServers.js";
import { targetLoader } from "./plugins/targetLoader.js";
import "../vite-types.js";
import type { Photon } from "../types.js";

export { photon, installPhoton, supportedTargetServers, targetLoader, type InstallPhotonOptions, photon as default };

function photon(config?: Photon.Config): Plugin[] {
  return [
    ...commonConfig(),
    ...resolvePhotonConfigPlugin(config),
    ...photonEntry(),
    ...mirrorMeta(),
    fallback(),
    devServer(config),
    ...getMiddlewaresPlugin(),
  ];
}

interface InstallPhotonOptions {
  fullInstall?: boolean;
}

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
