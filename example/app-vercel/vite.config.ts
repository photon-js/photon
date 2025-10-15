import { vercel } from "@photonjs/vercel/vite";
import { awesomeFramework } from "awesome-framework/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // No photon server entry is defined, it will fallback to a virtual entry
  photon: {
    entries: {
      // foo entry declares its route with `enhance` directly inside the file
      foo: "src/middlewares/foo.ts",
      // bar entry route is declared here, and `enhance` is not used
      bar: {
        id: "src/middlewares/bar.ts",
        route: "/bar",
      },
    },
  },
  plugins: [awesomeFramework(), vercel()],
});
