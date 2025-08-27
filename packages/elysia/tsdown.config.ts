import { defineConfig, type Options as TsupOptions } from "tsdown";

const commonOptions: TsupOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  external: ["elysia", /^photon:get-middlewares:/, /^@photonjs\/core/, /^@photonjs\/elysia/],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      // serve (noop)
      "serve": "./src/serve-noop.ts",
      // apply (edge)
      "apply.edge": "./src/apply-edge.ts",
    }
  },
  {
    ...commonOptions,
    platform: "node",
    entry: {
      // serve (bun)
      "serve.bun": "./src/serve-bun.ts",
      // serve (deno)
      "serve.deno": "./src/serve-deno.ts",
      // serve (node)
      "serve.node": "./src/serve-node.ts",
      // apply (dev)
      "apply.dev": "./src/apply-dev.ts",
      // apply (node)
      "apply": "./src/apply-node.ts",
    },
  }
]);
