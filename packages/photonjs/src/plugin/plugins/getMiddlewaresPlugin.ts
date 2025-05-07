import type { PluginContext } from 'rollup'
import type { Plugin } from 'vite'

// TODO remove rest param?
const re_getMiddlewares = /^photon:get-middlewares:(?<condition>dev|edge|node):(?<server>[^:]+)(?<rest>.*)/
interface MatchGroups {
  condition: 'dev' | 'edge' | 'node'
  server: string
  rest: string
}

function testGetMiddlewares(id: string): MatchGroups | null {
  const match = id.match(re_getMiddlewares)
  if (!match) return null
  return match.groups as unknown as MatchGroups
}

function getAllPhotonMiddlewares(pluginContext: PluginContext, id: string) {
  const match = testGetMiddlewares(id)
  if (!match) throw new Error(`Invalid id ${id}`)

  const { index, ...nonIndexEntries } = pluginContext.environment.config.photon.entry
  // non-index entries are always considered Universal Handlers
  const universalEntries = Object.values(nonIndexEntries).map((e) => e.id)

  const getMiddlewares = pluginContext.environment.config.photon.middlewares ?? []
  const middlewares = getMiddlewares
    .map((m) => m.call(pluginContext, match.condition, match.server))
    .filter((x) => typeof x === 'string' || Array.isArray(x))
    .flat(1)

  // TODO handle libs returning UniversalMiddleware, UniversalMiddleware[], and (options?) => UniversalMiddleware | UniversalMiddleware[]
  //language=ts
  return `
import { getUniversal, getUniversalProp, nameSymbol, universalSymbol } from '@universal-middleware/core';
${middlewares.map((m, i) => `import m${i} from ${JSON.stringify(m)};`).join('\n')}
${universalEntries.map((m, i) => `import u${i} from ${JSON.stringify(m)};`).join('\n')}

function errorMessage1(id) {
  return \`PhotonError: "\${id}" default export must be wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance\`
}

function errorMessage2(id) {
  return \`PhotonError: "\${id}" default export must be a function or an array of functions.\`
}

export function isValidUniversalMiddleware(middleware, id) {
  if (!getUniversalProp(middleware, nameSymbol)) {
    throw new TypeError(\`PhotonError: \${id} requires a name. Use enhance helper as described in the documentation: https://universal-middleware.dev/helpers/enhance\`);
  }
  return middleware;
}

function extractUniversal(mi, id) {
  return [mi]
    .flat(Number.POSITIVE_INFINITY)
    .map(m => {
      if (typeof m === 'function') {
        return getUniversal(m);
      }
      throw new Error(errorMessage2(id));
    }
  );
}

function getMiddlewares(mi, id) {
  return [mi]
    .flat(Number.POSITIVE_INFINITY)
    .map(m => {
      if (nameSymbol in m) {
        return m;
      }
      if (typeof m === 'function') {
        // Assume it's a UniversalMidleware getter
        let r;
        try {
          r = m();
        } catch (e) {
          throw new Error(errorMessage1(id), { cause: e })
        }
        if (r instanceof Promise) {
          r.catch(e => {
            throw new Error(errorMessage1(id), { cause: e })
          });
          throw new Error(errorMessage1(id));
        }
        return r;
      }
      throw new Error(errorMessage2(id));
    })
    .map(m => extractUniversal(m, id))
    .flat(Number.POSITIVE_INFINITY);
}

export function getUniversalMiddlewares() {
  return [${middlewares.map((m, i) => `getMiddlewares(extractUniversal(m${i}, ${JSON.stringify(m)}), ${JSON.stringify(m)})`).join(', ')}]
    .flat(Number.POSITIVE_INFINITY)
    .map(isValidUniversalMiddleware);
}

export function getUniversalEntries() {
  return [${universalEntries.map((m, i) => `extractUniversal(u${i}, ${JSON.stringify(m)})`).join(', ')}]
    .flat(Number.POSITIVE_INFINITY)
    .map(isValidUniversalMiddleware);
}
`
}

export function getMiddlewaresPlugin(): Plugin[] {
  return [
    {
      name: 'photon:get-middlewares',

      async resolveId(id) {
        const match = testGetMiddlewares(id)
        if (match) {
          return id
        }
      },

      load(id) {
        const match = testGetMiddlewares(id)
        if (match) {
          return getAllPhotonMiddlewares(this, id)
        }
      },
    },
  ]
}
