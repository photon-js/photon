import { defineConfig, type Options as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  external: [/^virtual:photon:get-middlewares:/, /^@photonjs\/core/],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "node",
    entry: {
      plugin: "./src/plugin/index.ts",
      api: "./src/api.ts",
      internal: "./src/api/internal.ts",
      dev: "./src/dev.ts",
      assert: "./src/utils/assert.ts",
      index: "./src/index.ts",
    },
  },
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      // utils
      apply: "./src/apply.ts",
      serve: "./src/serve.ts",
    },
  },
]);
