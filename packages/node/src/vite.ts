import { store } from "@photonjs/store";
import type { Plugin } from "vite";

const re_photonServe = /^virtual:photon:serve-entry$/;
const re_photonServer = /^virtual:photon:server-entry$/;

// Creates a server and listens for connections in Node/Deno/Bun
export function node(): Plugin[] {
  return [
    // Resolves virtual:photon:server-entry to its actual id
    {
      name: "photon:resolve-server-entry",
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
      name: "photon:serve",
      apply: "build",

      resolveId: {
        filter: {
          id: re_photonServe,
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
      name: "photon:serve:emit-minimal",
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
