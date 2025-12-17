import { defineConfig, type UserConfig as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  fixedExtension: false,
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "neutral",
    entry: {
      index: "./src/index.ts",
      "catch-all": "./src/catch-all.ts",
      compat: "./src/rollup-entries-compat.ts",
    },
  },
]);
