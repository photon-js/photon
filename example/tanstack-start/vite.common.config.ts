import { catchAll } from "@photonjs/store/catch-all";
import { compat } from "@photonjs/store/compat";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  plugins: [
    devtools(),
    // TanStack exposes an SSR entry (exports `default { fetch }`) via rollupOptions.
    // The compat plugin picks it up and registers it in the global store with a default catch-all pattern.
    compat(),
    // Provides the virtual catch-all entry required by the compat plugin.
    catchAll(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
