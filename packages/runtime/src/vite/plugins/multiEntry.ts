import { store } from "@universal-deploy/store";
import type { Plugin } from "vite";
import { transformStoreInPlace } from "../../store-proxy.js";
import { createParam } from "../../utils.js";
import type { PhotonPluginOptions } from "../types.js";

const p_photonEntryRaw = createParam("γEntryRaw");
const p_photonEntryResolved = createParam("γEntryResolved");
const re_photonEntry = /^virtual:photon:entry$/;

/**
 * This plugin ensures that Photon entry can be reused under multiple routes.
 */
export function photonMultiEntryPlugin(options: PhotonPluginOptions): Plugin {
  return {
    name: "photon:resolve-entry",
    enforce: "pre",
    async config() {
      // FIXME support .server.nodeHandler entries directly in VPV
      // FIXME use same format as srvx for serve option and nodeHandler ?
      transformStoreInPlace(store, (entry) => ({
        ...entry,
        // ?γ=0 is to avoid overriding the entry extension
        id: `${options.entry}?${p_photonEntryRaw.param}=${encodeURIComponent(`${entry.id}?γ`)}`,
      }));
    },
    resolveId: {
      filter: {
        id: [re_photonEntry, p_photonEntryRaw.re],
      },
      async handler(id, importer) {
        // virtual:photon:entry will be replaced by given photonEntry
        if (importer?.match(p_photonEntryResolved.re) && id.match(re_photonEntry)) {
          const params = new URLSearchParams(importer.split("?")[1]);
          // biome-ignore lint/style/noNonNullAssertion: ok
          return params.get(p_photonEntryResolved.param)!;
        }

        // Resolves both parent and child entries
        if (id.match(p_photonEntryRaw.re)) {
          const [parent, paramsRaw] = id.split("?") as [string, string];
          const params = new URLSearchParams(paramsRaw);
          // biome-ignore lint/style/noNonNullAssertion: ok
          const photonEntry = params.get(p_photonEntryRaw.param)!;
          const [resolvedParent, resolvedChild] = await Promise.all([
            this.resolve(parent, importer),
            this.resolve(photonEntry),
          ]);
          if (!resolvedParent || !resolvedChild) {
            return null;
          }

          return {
            ...resolvedParent,
            id: `${resolvedParent.id}?${p_photonEntryResolved.param}=${encodeURIComponent(resolvedChild.id)}`,
          };
        }

        // By default, virtual:photon:entry resolves to virtual:ud:catch-all?default
        return this.resolve("virtual:ud:catch-all?default", importer);
      },
    },
  };
}
