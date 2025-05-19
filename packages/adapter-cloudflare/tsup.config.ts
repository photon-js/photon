import { builtinModules } from 'node:module'
import { defineConfig, type Options as TsupOptions } from 'tsup'

const externalServers: (string | RegExp)[] = ['elysia', 'fastify', 'h3', 'hono']

const commonOptions: TsupOptions = {
  format: ['esm'],
  target: 'es2022',
  esbuildOptions(opts) {
    opts.outbase = 'src'
  },
  dts: true,
  outDir: 'dist',
  treeshake: true,
  removeNodeProtocol: false,
}

export default defineConfig([
  {
    ...commonOptions,
    platform: 'node',
    entry: {
      index: './src/index.ts',
      vite: './src/plugin.ts',
    },
  },
  {
    ...commonOptions,
    platform: 'neutral',
    entry: {
      hono: './src/adapters/hono.ts',
      dev: './src/adapters/dev.ts',
    },
    // TODO shared Photon plugin?
    external: externalServers
      .concat(...builtinModules.flatMap((e) => [e, `node:${e}`]))
      .concat(/^@photonjs\/cloudflare/)
      .concat('@photonjs/core/dev'),
  },
])
