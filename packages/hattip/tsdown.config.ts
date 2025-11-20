import { defineConfig, type Options as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  external: [/^virtual:photon:get-middlewares:/, /^@photonjs\/core/, /^@photonjs\/hattip/],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      // serve
      serve: "./src/serve.ts",
      // apply (edge)
      "apply.edge": "./src/apply-edge.ts",
    },
  },
  {
    ...commonOptions,
    platform: "node",
    entry: {
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
