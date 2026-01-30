import type { Plugin } from "vite";

const re_photonNodeEntry = /^virtual:photon:node-entry$/;

/**
 * Wrapper around @universal-deploy/node supporting `nodeHandler` when available
 */
export function photonNodePlugin(): Plugin {
  return {
    name: "photon:node:node-entry",
    apply: "build",

    resolveId: {
      order: "pre",
      filter: {
        id: re_photonNodeEntry,
      },
      async handler(id, importer) {
        const resolved = await this.resolve("@photonjs/runtime/serve", importer);
        if (!resolved) {
          throw new Error(`Cannot find server entry ${JSON.stringify(id)}`);
        }

        return {
          id: resolved.id,
        };
      },
    },

    config() {
      return {
        ssr: {
          // Do not mark import("@universal-deploy/node/server") as external as it contains a virtual module
          noExternal: ["@universal-deploy/node"],
        },
      };
    },
  };
}
