import { photon } from "@photonjs/runtime/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { catchAll, compat, devServer } from "@universal-deploy/store/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  plugins: [
    devtools(),
    photon({
      entry: "./server.ts",
    }),
    // Tanstack Start doesn't integrate with universal-deploy/photon directly but provides an SSR entry that exports `default { fetch }`.
    // With this option set to true, universal-deploy will automatically wrap that entry for you.
    compat(),
    devServer(),
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
