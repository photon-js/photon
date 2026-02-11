import { cloudflare } from "@cloudflare/vite-plugin";
import { photon } from "@photonjs/runtime/vite";
import { addEntry } from "@universal-deploy/store";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";

addEntry({
  id: "./src/middlewares/foo.ts",
  method: "GET",
  route: "/foo",
});
addEntry({
  id: "./src/middlewares/bar.ts",
  method: "GET",
  route: "/bar",
});

export default defineConfig({
  plugins: [
    photon({
      entry: "./server.ts",
    }),
    cloudflare({
      viteEnvironment: {
        name: "ssr",
      },
      inspectorPort: false,
    }),
    awesomeFramework(),
  ],
});
