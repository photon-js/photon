import { defineConfig, type Options as TsdownOptions } from "tsdown";

const commonOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  external: [/^photon:get-middlewares:/, /^@photonjs\/core\/dev/, /^@photonjs\/vercel/],
} satisfies TsdownOptions;

export default defineConfig([
  {
    ...commonOptions,
    platform: "node",
    entry: {
      index: "./src/index.ts",
      utils: "./src/utils.ts",
      api: "./src/api.ts",
      types: "./src/types.ts",
      "universal-middleware-dev": "./src/universal-middleware/dev.ts",
      "universal-middleware-prod": "./src/universal-middleware/prod.ts",
    },
  },
]);
