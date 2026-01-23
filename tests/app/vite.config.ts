import { cloudflare } from "@cloudflare/vite-plugin";
import { serve } from "@photonjs/runtime/vite";
import { store } from "@universal-deploy/store";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";
import { vercel } from "vite-plugin-vercel/vite";

const target = process.env.TARGET ?? "node";
const server = process.env.SERVER ?? "hono";

store.entries.push({
  id: "./hmr-route.ts",
  method: "GET",
  pattern: "/hmr",
});

export default defineConfig({
  plugins: [
    target === "cloudflare" &&
      cloudflare({
        inspectorPort: false,
      }),
    target === "vercel" && vercel(),
    target === "node" && serve(),
    awesomeFramework(),
    {
      name: "resolve-local-entry",
      resolveId: {
        order: "pre",
        filter: {
          id: {
            include: [/^virtual:ud:catch-all$/],
          },
        },
        handler(_, importer, opts) {
          return this.resolve(`./${server}-entry.ts`, importer, opts);
        },
      },
    },
  ],
  build: {
    emptyOutDir: true,
  },
});
