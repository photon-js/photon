import { yellow } from "ansis";
import type { Plugin } from "vite";
import type { Photon } from "../../types.js";
import { PhotonConfigError } from "../../utils/assert.js";
import { resolvePhotonConfig } from "../../validators/coerce.js";
import { singleton } from "../utils/dedupe.js";

let resolvedPhotonConfig: Photon.ConfigResolved | null = null;
export function resolvePhotonConfigPlugin(pluginConfig?: Photon.Config): Plugin[] {
  const plugins: Plugin[] = [
    singleton({
      name: "photon:resolve-config",
      enforce: "pre",

      config: {
        order: "pre",
        handler() {
          return {
            photon: [],
          };
        },
      },

      configResolved: {
        order: "pre",
        handler(config) {
          // Ensures that a unique photon config exists across all envs
          if (resolvedPhotonConfig === null) {
            if (Array.isArray(config.photon.entries)) {
              // If `entries` is already an Array, it means that `config.photon` is already resolved,
              // most probably because another version of this plugin is installed.
              console.warn(
                yellow(
                  "[photon] Multiple versions of @photonjs/core detected. This may cause unexpected behavior. Try running 'npm dedupe' or 'yarn dedupe' to resolve version conflicts.",
                ),
              );
              resolvedPhotonConfig = config.photon;
            } else {
              // biome-ignore lint/suspicious/noExplicitAny: any
              resolvedPhotonConfig = resolvePhotonConfig(config.photon as any);
            }
          }
          if (resolvedPhotonConfig.codeSplitting.framework) {
            const serverConfigEntries = resolvedPhotonConfig.entries.filter((e) => e.type === "server-config");
            if (serverConfigEntries.length > 0) {
              throw new PhotonConfigError(
                "server-config entries are not supported when codeSplitting.framework is true. Please disable code splitting or remove server-config entries.",
              );
            }
          }
          config.photon = resolvedPhotonConfig;
        },
      },
    }),
  ];

  if (pluginConfig) {
    plugins.push({
      name: "photon:manual-config",
      enforce: "pre",

      config: {
        order: "pre",
        handler() {
          return {
            photon: [pluginConfig],
          };
        },
      },
    });
  }

  return plugins;
}
