import { defineConfig, type UserConfig as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  fixedExtension: false,
  external: [/^virtual:photon:get-middlewares:/, /^@photonjs\/core/],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "node",
    entry: {
      plugin: "./src/plugin/index.ts",
      internal: "./src/api/internal.ts",
      dev: "./src/dev.ts",
      index: "./src/index.ts",
    },
  },
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      // utils
      serve: "./src/serve.ts",
    },
  },
]);
