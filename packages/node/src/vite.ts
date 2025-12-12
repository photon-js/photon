import type { Plugin } from "vite";

const re_photonNode = /^virtual:photon:node-entry$/;

// Creates a server and listens for connections in Node/Deno/Bun
export function node(): Plugin[] {
  return [
    // Resolves virtual:photon:node-entry to its node runtime id
    {
      name: "photon:node:node-entry",
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
      name: "photon:node:emit",
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
                      index: "virtual:photon:node-entry",
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
