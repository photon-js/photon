import { store } from "@universal-deploy/store";
import type { Plugin } from "vite";
import { transformStoreInPlace } from "../../store-proxy.js";
import { createParam } from "../../utils.js";
import type { PhotonPluginOptions } from "../types.js";

const p_photonEntryRaw = createParam("γEntryRaw");
const p_photonEntryResolved = createParam("γEntryResolved");
const re_photonEntry = /^virtual:photon:entry$/;

/**
 * When active, this plugin ensures that Photon entry can be reused under multiple routes, when routing is delegated.
 */
export function photonMultiEntryPlugin(options: PhotonPluginOptions): Plugin {
  return {
    name: "photon:resolve-entry",
    enforce: "pre",
    async config() {
      if (options.routingMode === "delegated") {
        transformStoreInPlace(store, (entry) => ({
          ...entry,
          id: `${options.entry}?${p_photonEntryRaw.param}=${entry.id}`,
        }));
      }
    },
    resolveId: {
      filter: {
        id: [re_photonEntry, p_photonEntryRaw.re],
      },
      async handler(id, importer) {
        // Wrap current store entry with user entry
        // In this scenario, virtual:photon:entry will be replaced by given photonEntry
        if (importer?.match(p_photonEntryResolved.re) && id.match(re_photonEntry)) {
          const params = new URLSearchParams(importer.split("?")[1]);
          // biome-ignore lint/style/noNonNullAssertion: ok
          const photonEntry = params.get(p_photonEntryResolved.param)!;
          return atob(photonEntry);
        }

        // Resolves both parent and child entries
        if (id.match(p_photonEntryRaw.re)) {
          const [parent, paramsRaw] = id.split("?") as [string, string];
          const resolvedParent = await this.resolve(parent, importer);
          if (!resolvedParent) return resolvedParent;

          const params = new URLSearchParams(paramsRaw);
          // biome-ignore lint/style/noNonNullAssertion: ok
          const photonEntry = params.get(p_photonEntryRaw.param)!;
          const resolvedChild = await this.resolve(photonEntry, resolvedParent.id);
          if (!resolvedChild) return photonEntry;

          return {
            ...resolvedParent,
            // Vite uses the module extension internally to guess the parser,
            // so we need to make sure that this extension is not overridden by the child entry.
            id: `${resolvedParent.id}?${p_photonEntryResolved.param}=${btoa(resolvedChild.id)}`,
          };
        }

        // By default, virtual:photon:entry resolves to virtual:ud:catch-all?default
        return this.resolve("virtual:ud:catch-all?default", importer);
      },
    },
    writeBundle(_opts, bundle) {
      if (this.environment.config.consumer !== "server" || options.routingMode === "delegated") return;
      const modules = Object.values(bundle).flatMap((value) => {
        if (value.type === "chunk") {
          return value.moduleIds;
        }
        return [];
      });
      if (modules.length === 0) return;
      const rollupInput = this.environment.config.build.rollupOptions.input;
      const storeEntries = new Set(store.entries.map((e) => e.id));
      if (
        typeof rollupInput === "object" &&
        // In this env, rollup input were store entries
        Object.values(rollupInput).some((i) => storeEntries.has(i)) &&
        // Photon entry was not included in the bundle
        !modules.some((m) => m.match(p_photonEntryResolved.re))
      ) {
        this.warn(
          `Photon entry (${options.entry}) wasn't included in the bundle.\nEnable { routingMode: "delegated" } in the Photon plugin.`,
        );
      }
    },
  };
}
