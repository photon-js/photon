/// <reference types="@photonjs/runtime" />
/* The Vite plugin cloudflare() will be replaced by this:
import cloudflare from '@photonjs/cloudflare'
*/
import { cloudflare } from "@photonjs/cloudflare/vite";
import { vercel } from "@photonjs/vercel/vite";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";

const target = process.env.TARGET ?? "node";
const server = process.env.SERVER ?? "hono";

export default defineConfig({
  photon: {
    server: `${server}-entry.ts`,
    /* The Vite plugin cloudflare() will be replaced by this:
    target: cloudflare, // not needed when using @photonjs/auto
    */
  },
  plugins: [
    // Will be replaced with a photon.target setting
    target === "cloudflare" &&
      cloudflare({
        inspectorPort: false,
      }), // not needed when using @photonjs/auto
    target === "vercel" && vercel(),
    awesomeFramework(),
  ],
  build: {
    emptyOutDir: true,
  },
});
