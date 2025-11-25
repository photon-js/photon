import { defineConfig, type Options as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  external: [/^@photonjs\/core/, /^@photonjs\/hono/, /^virtual:photon:get-middlewares:/, "virtual:photon:server-entry"],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "node",
    entry: {
      vite: "./src/vite.ts",
      serve: "./src/serve.ts",
      "serve-dev": "./src/serve-dev.ts",
      internal: "./src/internal.ts",
      index: "./src/index.ts",
      sirv: "./src/sirv.ts",
    },
  },
]);
