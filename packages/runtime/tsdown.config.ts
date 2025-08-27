import { defineConfig, type Options as TsupOptions } from "tsdown";

const commonOptions: TsupOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  external: [/^@photonjs\/core/, /^@photonjs\/hono/, /^photon:get-middlewares:/, "hono"],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "node",
    entry: {
      plugin: "./src/plugin.ts",
      index: "./src/index.ts",
    },
  },
]);
