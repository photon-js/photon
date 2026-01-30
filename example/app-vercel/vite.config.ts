import { photon } from "@photonjs/runtime/vite";
import { store } from "@universal-deploy/store";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";
import { vercel } from "vite-plugin-vercel/vite";

// should be a helper in @universal-deploy/store
if (!(store as any)[Symbol.for("myapp")]) {
  (store as any)[Symbol.for("myapp")] = true;
  store.entries.push({
    id: "./src/middlewares/foo.ts",
    method: "GET",
    pattern: "/foo",
  });
  store.entries.push({
    id: "./src/middlewares/bar.ts",
    method: "GET",
    pattern: "/bar",
  });
}

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
