/// <reference types="@photonjs/runtime" />
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";

export default defineConfig({
  photon: {
    server: "server.ts",
  },
  plugins: [awesomeFramework()],
});
