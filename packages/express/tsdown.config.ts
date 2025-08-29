import { defineConfig, type Options as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  external: ["express", /^photon:get-middlewares:/, /^@photonjs\/core/, /^@photonjs\/express/],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      // serve (noop)
      serve: "./src/serve-noop.ts",
    },
  },
  {
    ...commonOptions,
    platform: "node",
    entry: {
      // serve (node)
      "serve.node": "./src/serve-node.ts",
      // apply (dev)
      "apply.dev": "./src/apply-dev.ts",
      // apply (node)
      apply: "./src/apply-node.ts",
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
