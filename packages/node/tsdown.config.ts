import { defineConfig, type UserConfig as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: true,
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  fixedExtension: false,
  external: ["virtual:photon:server-entry"],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "node",
    entry: {
      vite: "./src/vite.ts",
      serve: "./src/serve.ts",
      index: "./src/index.ts",
    },
  },
]);
