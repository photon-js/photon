import type { Plugin } from "vite";
import { photonDevPlugin } from "./plugins/dev.js";
import { photonEnhancePlugin } from "./plugins/enhance.js";
import { photonMultiEntryPlugin } from "./plugins/multiEntry.js";
import type { PhotonPluginOptions } from "./types.js";

const re_catchAll = /^virtual:ud:catch-all$/;

export function photon(options: PhotonPluginOptions): Plugin[] {
  return [
    photonMultiEntryPlugin(options),
    photonDevPlugin(),
    photonEnhancePlugin(),
    {
      name: "photon:node:resolve-local-entry",
      resolveId: {
        order: "pre",
        filter: {
          id: re_catchAll,
        },
        handler() {
          // Will resolve the entry from the users project root
          return this.resolve(options.entry);
        },
      },
    },
  ];
}
