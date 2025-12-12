import { store } from "@photonjs/store";
import type { Plugin } from "vite";

const re_photonServer = /^virtual:photon:server-entry$/;
const re_photonNode = /^virtual:photon:node-entry$/;

// Creates a server and listens for connections in Node/Deno/Bun
export function node(): Plugin[] {
  return [
    // Resolves virtual:photon:server-entry to its actual id
    {
      name: "photon:resolve:server-entry",
      resolveId: {
        filter: {
          id: re_photonServer,
        },
        handler() {
          return this.resolve(store.catchAllEntry);
        },
      },
    },
    // Resolves virtual:photon:serve-entry to its node runtime id
    {
      name: "photon:node",
      apply: "build",

      resolveId: {
        filter: {
          id: re_photonNode,
        },
        async handler(id, importer) {
          const resolved = await this.resolve("@photonjs/node/serve", importer);
          if (!resolved) {
            throw new Error(`Cannot find server entry ${JSON.stringify(id)}`);
          }

          return {
            id: resolved.id,
          };
        },
      },
    },
    // Emit the node entry
    {
      name: "photon:mode:emit",
      apply: "build",
      config: {
        order: "post",
        handler() {
          return {
            environments: {
              ssr: {
                build: {
                  rollupOptions: {
                    input: {
                      index: "virtual:photon:serve-entry",
                    },
                  },
                },
              },
            },
          };
        },
      },
    },
  ];
}
