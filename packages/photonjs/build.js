import { build } from 'tsup'

const externalServers = ['elysia', 'fastify', 'h3', 'hono']

const commonOptions = {
  format: ['esm'],
  target: 'es2022',
  esbuildOptions(opts) {
    opts.outbase = 'src'
  },
  dts: {
    compilerOptions: {
      rootDir: './',
    },
  },
  outDir: 'dist',
  treeshake: true,
  removeNodeProtocol: false,
  external: externalServers.concat(/^photon:get-middlewares:/).concat(/^@photonjs\/core/),
}

await build({
  ...commonOptions,
  platform: 'node',
  entry: {
    plugin: './src/plugin/index.ts',
    api: './src/api.ts',
    dev: './src/dev.ts',
    assert: './src/utils/assert.ts',
    index: './src/index.ts',
  },
})

await build({
  ...commonOptions,
  platform: 'neutral',
  entry: {
    // serve (noop)
    'elysia/serve': './src/serve/noop/elysia.ts',
    'express/serve': './src/serve/noop/express.ts',
    'fastify/serve': './src/serve/noop/fastify.ts',
    'h3/serve': './src/serve/noop/h3.ts',
    'hattip/serve': './src/serve/noop/hattip.ts',
    'hono/serve': './src/serve/noop/hono.ts',
    // apply (edge)
    'elysia/apply.edge': './src/apply/edge/elysia.ts',
    'h3/apply.edge': './src/apply/edge/h3.ts',
    'hattip/apply.edge': './src/apply/edge/hattip.ts',
    'hono/apply.edge': './src/apply/edge/hono.ts',
  },
})

await build({
  ...commonOptions,
  platform: 'node',
  entry: {
    // serve (bun)
    'elysia/serve.bun': './src/serve/bun/elysia.ts',
    'h3/serve.bun': './src/serve/bun/h3.ts',
    'hattip/serve.bun': './src/serve/bun/hattip.ts',
    'hono/serve.bun': './src/serve/bun/hono.ts',
    // serve (deno)
    'elysia/serve.deno': './src/serve/deno/elysia.ts',
    'h3/serve.deno': './src/serve/deno/h3.ts',
    'hattip/serve.deno': './src/serve/deno/hattip.ts',
    'hono/serve.deno': './src/serve/deno/hono.ts',
    // serve (node)
    'elysia/serve.node': './src/serve/node/elysia.ts',
    'express/serve.node': './src/serve/node/express.ts',
    'fastify/serve.node': './src/serve/node/fastify.ts',
    'h3/serve.node': './src/serve/node/h3.ts',
    'hattip/serve.node': './src/serve/node/hattip.ts',
    'hono/serve.node': './src/serve/node/hono.ts',
    // apply (dev)
    'elysia/apply.dev': './src/apply/dev/elysia.ts',
    'express/apply.dev': './src/apply/dev/express.ts',
    'fastify/apply.dev': './src/apply/dev/fastify.ts',
    'h3/apply.dev': './src/apply/dev/h3.ts',
    'hattip/apply.dev': './src/apply/dev/hattip.ts',
    'hono/apply.dev': './src/apply/dev/hono.ts',
    // apply (node)
    'elysia/apply': './src/apply/node/elysia.ts',
    'express/apply': './src/apply/node/express.ts',
    'fastify/apply': './src/apply/node/fastify.ts',
    'h3/apply': './src/apply/node/h3.ts',
    'hattip/apply': './src/apply/node/hattip.ts',
    'hono/apply': './src/apply/node/hono.ts',
  },
})

await build({
  ...commonOptions,
  platform: 'neutral',
  entry: {
    // servers
    elysia: './src/servers/elysia.ts',
    express: './src/servers/express.ts',
    fastify: './src/servers/fastify.ts',
    h3: './src/servers/h3.ts',
    hattip: './src/servers/hattip.ts',
    hono: './src/servers/hono.ts',
  },
})
