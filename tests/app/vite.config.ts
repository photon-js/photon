import { cloudflare } from "@cloudflare/vite-plugin";
import { photon } from "@photonjs/runtime";
import { node } from "@universal-deploy/node/vite";
import { addEntry } from "@universal-deploy/store";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";
import { vercel } from "vite-plugin-vercel/vite";

const target = process.env.TARGET ?? "node";
const server = process.env.SERVER ?? "hono";

addEntry({
  id: "./hmr-route.ts",
  method: "GET",
  route: "/hmr",
});

export default defineConfig({
  plugins: [
    photon({ entry: `./${server}-entry.ts` }),
    target === "cloudflare" &&
      cloudflare({
        viteEnvironment: {
          name: "ssr",
        },
        inspectorPort: false,
      }),
    target === "vercel" && vercel(),
    (target === "node" || target === "bun" || target === "deno") &&
      node({
        static: "dist/client",
      }),
    awesomeFramework(),
  ],
  build: {
    emptyOutDir: true,
  },
});
