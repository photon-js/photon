import { defineConfig, type UserConfig as TsdownOptions } from "tsdown";

const commonOptions: TsdownOptions = {
  format: ["esm"],
  target: "es2022",
  dts: {
    enabled: true,
    resolve: ["srvx"],
  },
  outDir: "dist",
  treeshake: true,
  nodeProtocol: true,
  fixedExtension: false,
  external: ["virtual:photon:server-entry", "virtual:ud:catch-all"],
};

export default defineConfig([
  {
    ...commonOptions,
    platform: "node",
    entry: {
      vite: "./src/vite/index.ts",
      internal: "./src/internal.ts",
      index: "./src/index.ts",
    },
  },
]);
