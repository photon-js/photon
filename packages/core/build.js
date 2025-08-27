import { build } from "tsup";

const externalServers = ["elysia", "fastify", "h3", "hono"];

const commonOptions = {
  format: ["esm"],
  target: "es2022",
  esbuildOptions(opts) {
    opts.outbase = "src";
  },
  dts: {
    compilerOptions: {
      rootDir: "./",
    },
  },
  outDir: "dist",
  treeshake: true,
  removeNodeProtocol: false,
  external: externalServers.concat(/^photon:get-middlewares:/).concat(/^@photonjs\/core/),
};

await build({
  ...commonOptions,
  platform: "node",
  entry: {
    plugin: "./src/plugin/index.ts",
    api: "./src/api.ts",
    dev: "./src/dev.ts",
    assert: "./src/utils/assert.ts",
    index: "./src/index.ts",
  },
});

await build({
  ...commonOptions,
  platform: "neutral",
  entry: {
    // utils
    apply: "./src/apply.ts",
    serve: "./src/serve.ts",
  },
});
