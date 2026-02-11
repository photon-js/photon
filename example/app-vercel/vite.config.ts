import { photon } from "@photonjs/runtime/vite";
import { addEntry } from "@universal-deploy/store";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";
import { vercel } from "vite-plugin-vercel/vite";

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
    vercel({
      viteEnvNames: {
        client: "client",
        node: "ssr",
      },
    }),
    awesomeFramework(),
  ],
});
