// import { installPhoton } from "@photonjs/runtime/vite";
import { minimalPhoton } from "@photonjs/core/vite";
import { minimalPhotonRuntime } from "@photonjs/runtime/vite";
import { store } from "@photonjs/store";
import type { Plugin } from "vite";

export function photonPlugin(): Plugin[] {
  return [
    {
      name: "awesome-framework:photon",
      config() {
        store.entries.push(
          {
            id: "awesome-framework/standalone",
            name: "awesome-framework/standalone",
            pattern: "/standalone",
          },
          {
            id: "awesome-framework/api",
            name: "awesome-framework/api",
            pattern: "/api",
          },
          // fallback entry
          {
            id: "awesome-framework/ssr",
            name: "awesome-framework/ssr",
            isolated: true,
          },
          // catch-all entry
          {
            id: "awesome-framework/catch-all",
            name: "awesome-framework/catch-all",
          },
        );
      },
    },
    ...minimalPhoton(),
    ...minimalPhotonRuntime(),
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
