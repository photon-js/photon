import { defineConfig, type UserConfig as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  fixedExtension: false,
  external: ["express", /^@photonjs\/core/, /^@photonjs\/express/],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      // serve
      serve: "./src/serve.ts",
    },
  },
  {
    ...commonOptions,
    platform: "node",
    entry: {
      // serve
      "serve.node": "./src/serve.node.ts",
    },
  },
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      // index
      index: "./src/index.ts",
    },
  },
]);
