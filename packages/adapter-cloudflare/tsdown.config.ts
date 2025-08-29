import { builtinModules } from "node:module";
import { defineConfig, type Options as TsdownOptions } from "tsdown";

const commonOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  external: [/^photon:get-middlewares:/, /^@photonjs\/core\/dev/, /^@photonjs\/cloudflare/],
} satisfies TsdownOptions;

export default defineConfig([
  {
    ...commonOptions,
    platform: "node",
    entry: {
      index: "./src/index.ts",
      vite: "./src/plugin.ts",
    },
  },
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      hono: "./src/adapters/hono.ts",
      h3: "./src/adapters/h3.ts",
      dev: "./src/adapters/dev.ts",
    },
    external: [...commonOptions.external, ...builtinModules.flatMap((e) => [e, `node:${e}`])],
  },
]);
