import { cloudflare } from "@cloudflare/vite-plugin";
import { photon } from "@photonjs/runtime";
import { node } from "@universal-deploy/node/vite";
import { store } from "@universal-deploy/store";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";
import { vercel } from "vite-plugin-vercel/vite";

const target = process.env.TARGET ?? "node";
const server = process.env.SERVER ?? "hono";

if (!store.entries.some((e) => e.id === "./hmr-route.ts")) {
  store.entries.push({
    id: "./hmr-route.ts",
    method: "GET",
    pattern: "/hmr",
  });
}

export default defineConfig({
  plugins: [
    photon(),
    target === "cloudflare" &&
      cloudflare({
        inspectorPort: false,
      }),
    target === "vercel" && vercel(),
    target === "node" && node(),
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
