import { defineConfig, type UserConfig as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: {
    enabled: true,
    resolve: [/^@photonjs\/core/],
  },
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  fixedExtension: false,
  external: ["fastify", /^@photonjs\/fastify/],
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
