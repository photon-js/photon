import { netlify } from "@photonjs/netlify/vite";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // No photon server entry is defined, it will fallback to a virtual entry
  // FIXME Photon features
  // photon: {
  //   entries: {
  //     // foo entry declares its route with `enhance` directly inside the file
  //     foo: "src/middlewares/foo.ts",
  //     // bar entry route is declared here, and `enhance` is not used
  //     bar: {
  //       id: "src/middlewares/bar.ts",
  //       route: "/bar",
  //     },
  //   },
  // },
  plugins: [
    // Can be replaced by @photonjs/node/vite to target node/bun/deno instead
    netlify(),
    awesomeFramework(),
  ],
});
