import { node } from "@photonjs/node/vite";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [awesomeFramework(), node()],
});
