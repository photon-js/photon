import oxc from 'oxc-transform'
import type { UnpluginFactory } from 'unplugin'
import { assert } from '../utils/assert.js'

const re_apply = /^photon:virtual-apply:(?<condition>dev|edge|node):(?<server>[^:]+)(?<rest>.*)/
const re_index = /^photon:virtual-index:(?<server>[^:]+)(?<rest>.*)/
interface MatchGroups {
  condition?: 'dev' | 'edge' | 'node'
  server: string
  rest: string
}

function test(id: string, re: RegExp): MatchGroups | null {
  const match = id.match(re)
  if (!match) return null
  return match.groups as unknown as MatchGroups
}

function compileApply(id: string) {
  const match = test(id, re_apply)
  if (!match) throw new Error(`Invalid id ${id}`)

  const isAsync = match.server === 'fastify'

  //language=ts
  const code = `import { apply as applyAdapter } from '@universal-middleware/${match.server}';
import { getUniversalMiddlewares, getUniversalEntries, extractUniversal, errorMessageMiddleware } from 'photon:get-middlewares:${match.condition}:${match.server}${match.rest}';
import { type RuntimeAdapterTarget, type UniversalMiddleware, getUniversalProp, nameSymbol } from '@universal-middleware/core';
${match.condition === 'dev' ? 'import { devServerMiddleware } from "@photonjs/core/dev";' : ''}

function errorMessageMiddleware(id, index) {
  return \`PhotonError: additional middleware at index \${index} default export must respect the following type: UniversalMiddleware | UniversalMiddleware[]. Each individual middleware must be wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance\`
}
  
export ${isAsync ? 'async' : ''} function apply(app: Parameters<typeof applyAdapter>[0], additionalMiddlewares?: UniversalMiddleware[]): ${isAsync ? 'Promise<Parameters<typeof applyAdapter>[0]>' : 'Parameters<typeof applyAdapter>[0]'} {
  const middlewares = getUniversalMiddlewares();
  const entries = getUniversalEntries();
  ${match.condition === 'dev' ? 'middlewares.unshift(devServerMiddleware());' : ''}
  
  // dedupe
  if (additionalMiddlewares) {
    let index = 0;
    for (const middleware of extractUniversal(additionalMiddlewares, '', errorMessageMiddleware)) {
      const i = middlewares.findIndex(m => getUniversalProp(m, nameSymbol) === getUniversalProp(middleware, nameSymbol));
      if (i !== -1) {
        middlewares.splice(i, 1);
      }
      middlewares.push(middleware);
      index++;
    }
  }

  ${isAsync ? 'await' : ''} applyAdapter(app, [...middlewares, ...entries]);

  app[Symbol.for('photon:server')] = ${JSON.stringify(match.server)};

  return app;
}

export type RuntimeAdapter = RuntimeAdapterTarget<${JSON.stringify(match.server)}>;
`
  const result = oxc.transform(`${match.server}.${match.condition}.ts`, code, {
    sourcemap: true,
    typescript: {
      declaration: {},
    },
  })

  return {
    ...match,
    ...result,
  }
}

function compileIndex(id: string) {
  const match = test(id, re_index)
  if (!match) throw new Error(`Invalid id ${id}`)

  //language=ts
  const code = `export { apply, type RuntimeAdapter } from '@photonjs/core/${match.server}/apply'
export { serve } from '@photonjs/core/${match.server}/serve'
`
  const result = oxc.transform(`${match.server}.ts`, code, {
    sourcemap: true,
    typescript: {
      declaration: {},
    },
  })

  return {
    ...match,
    ...result,
  }
}

const entries = {
  // -- apply
  // dev
  'elysia/apply.dev': 'photon:virtual-apply:dev:elysia',
  'express/apply.dev': 'photon:virtual-apply:dev:express',
  'fastify/apply.dev': 'photon:virtual-apply:dev:fastify',
  'h3/apply.dev': 'photon:virtual-apply:dev:h3',
  'hattip/apply.dev': 'photon:virtual-apply:dev:hattip',
  'hono/apply.dev': 'photon:virtual-apply:dev:hono',
  // edge
  'elysia/apply.edge': 'photon:virtual-apply:edge:elysia',
  'h3/apply.edge': 'photon:virtual-apply:edge:h3',
  'hattip/apply.edge': 'photon:virtual-apply:edge:hattip',
  'hono/apply.edge': 'photon:virtual-apply:edge:hono',
  // node
  'elysia/apply': 'photon:virtual-apply:node:elysia',
  'express/apply': 'photon:virtual-apply:node:express',
  'fastify/apply': 'photon:virtual-apply:node:fastify',
  'h3/apply': 'photon:virtual-apply:node:h3',
  'hattip/apply': 'photon:virtual-apply:node:hattip',
  'hono/apply': 'photon:virtual-apply:node:hono',
  // -- index,
  elysia: 'photon:virtual-index:elysia',
  express: 'photon:virtual-index:express',
  fastify: 'photon:virtual-index:fastify',
  h3: 'photon:virtual-index:h3',
  hattip: 'photon:virtual-index:hattip',
  hono: 'photon:virtual-index:hono',
}

export const virtualApplyFactory: UnpluginFactory<undefined> = () => {
  return {
    name: 'photon:virtual-apply',

    esbuild: {
      config(opts) {
        opts.entryPoints ??= {}
        assert(!Array.isArray(opts.entryPoints))
        Object.assign(opts.entryPoints, entries)

        opts.external ??= []
        opts.external.push('@photonjs/core/elysia/apply')
        opts.external.push('@photonjs/core/elysia/serve')
        opts.external.push('@photonjs/core/express/apply')
        opts.external.push('@photonjs/core/express/serve')
        opts.external.push('@photonjs/core/fastify/apply')
        opts.external.push('@photonjs/core/fastify/serve')
        opts.external.push('@photonjs/core/h3/apply')
        opts.external.push('@photonjs/core/h3/serve')
        opts.external.push('@photonjs/core/hattip/apply')
        opts.external.push('@photonjs/core/hattip/serve')
        opts.external.push('@photonjs/core/hono/apply')
        opts.external.push('@photonjs/core/hono/serve')
      },
    },

    async resolveId(id) {
      if (test(id, re_apply) || test(id, re_index)) {
        return id
      }
    },

    loadInclude(id) {
      return Boolean(test(id, re_apply) || test(id, re_index))
    },

    load(id) {
      {
        const match = test(id, re_apply)
        if (match) {
          const compiled = compileApply(id)
          const fileName = Object.entries(entries).find(([, v]) => v === id)?.[0]
          assert(fileName)

          this.emitFile({
            type: 'asset',
            fileName: `${fileName}.d.ts`,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            source: compiled.declaration!,
          })

          return {
            code: compiled.code,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            map: compiled.map!,
          }
        }
      }
      {
        const match = test(id, re_index)
        if (match) {
          const compiled = compileIndex(id)
          const fileName = Object.entries(entries).find(([, v]) => v === id)?.[0]
          assert(fileName)

          this.emitFile({
            type: 'asset',
            fileName: `${fileName}.d.ts`,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            source: compiled.declaration!,
          })

          return {
            code: compiled.code,
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            map: compiled.map!,
          }
        }
      }
    },
  }
}
