import { defineConfig, type UserConfig as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  fixedExtension: false,
  external: ["h3", /^virtual:photon:get-middlewares:/, /^@photonjs\/core/, /^@photonjs\/h3/],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      // serve (noop)
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
