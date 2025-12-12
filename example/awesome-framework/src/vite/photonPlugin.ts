// import { installPhoton } from "@photonjs/runtime/vite";
import { minimalDevServer } from "@photonjs/core/vite";
import { store } from "@photonjs/store";
import { catchAll } from "@photonjs/store/catch-all";
import type { Plugin } from "vite";

export function photonPlugin(): Plugin[] {
  return [
    {
      name: "awesome-framework:photon",
      config() {
        store.entries.push(
          {
            id: "awesome-framework/standalone",
            pattern: "/standalone",
          },
          {
            id: "awesome-framework/api",
            pattern: "/api",
          },
          {
            id: "awesome-framework/ssr",
            pattern: "/:slug*",
          },
        );
      },
    },
    {
      name: "awesome-framework:client-entry",
      enforce: "pre",
      resolveId: {
        filter: {
          id: /^virtual:awesome-framework:client-entry$/,
        },
        handler() {
          console.log("resolving", "virtual:awesome-framework:client-entry");
          return this.resolve("src/entry-client.ts");
        },
      },
    },
    // FIXME this is used to make devServer run on user-provided servers + fallback, with HMR
    //  Make this an opt-in plugin
    // devServer(),
    // Forwards request to server entries from a vite dev server middleware
    minimalDevServer(),
    // Required for other plugin to work
    catchAll(),
  ];
  // return installPhoton("awesome-framework", {
  //   // Disables code-splitting functionality for testing purposes
  //   codeSplitting: {
  //     framework: false,
  //   },
  //
  //   // Always use those middlewares for all entries defined by Photon
  //   async resolveMiddlewares() {
  //     return "awesome-framework/universal-middleware";
  //   },
  //
  //   // Configuration for entry points used by Photon
  //   entries: {
  //     standalone: {
  //       // Unique identifier for this entry point. Is resolved by Vite
  //       id: "awesome-framework/standalone",
  //
  //       // Sets composition mode to 'isolated', preventing it from
  //       // being composed with middlewares defined in `resolveMiddlewares`
  //       compositionMode: "isolated",
  //     },
  //   },
  // });
}
