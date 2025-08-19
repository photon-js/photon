import { installPhoton } from "@photonjs/core/vite";
import type { Plugin } from "vite";

export function photonPlugin(): Plugin[] {
  return installPhoton("awesome-framework", {
    // Enables full installation of all Photon plugins
    fullInstall: true,

    // Disables code-splitting functionality for testing purposes
    codeSplitting: {
      framework: false,
    },

    // Always use those middlewares for all entries defined by Photon
    resolveMiddlewares() {
      return "awesome-framework/universal-middleware";
    },

    // Configuration for entry points used by Photon
    entries: {
      standalone: {
        // Unique identifier for this entry point. Is resolved by Vite
        id: "awesome-framework/standalone",

        // Sets composition mode to 'isolated', preventing it from
        // being composed with middlewares defined in `resolveMiddlewares`
        compositionMode: "isolated",
      },
    },
  });
}
