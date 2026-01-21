// import { cloudflare } from "@photonjs/cloudflare/vite";
// import { vercel } from "@photonjs/vercel/vite";
import { store } from "@universal-deploy/store";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";

const target = process.env.TARGET ?? "node";
const server = process.env.SERVER ?? "hono";

store.entries.push({
  id: "./hmr-route.ts",
  method: "GET",
  pattern: "/hmr",
});

export default defineConfig({
  plugins: [
    // // Will be replaced with a photon.target setting
    // target === "cloudflare" &&
    //   cloudflare({
    //     inspectorPort: false,
    //   }), // not needed when using @photonjs/auto
    // target === "vercel" && vercel(),
    awesomeFramework(),
  ],
  build: {
    emptyOutDir: true,
  },
});
