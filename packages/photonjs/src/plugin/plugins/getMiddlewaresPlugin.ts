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
${middlewares.map((m, i) => `import m${i} from ${JSON.stringify(m)};`).join('\n')}
${universalEntries.map((m, i) => `import u${i} from ${JSON.stringify(m)};`).join('\n')}

const universalSymbol = Symbol.for("universal");
const unNameSymbol = Symbol.for("unName");

export function getUniversalMiddlewares() {
  return [${middlewares.map((_, i) => `m${i}`).join(', ')}]
    .flat(Number.POSITIVE_INFINITY)
    .map(m => {
      if (typeof m === 'function') {
        if (universalSymbol in m) {
          return m[universalSymbol];
        }
        if (unNameSymbol in m) {
          return m;
        }
        // Assume it's a UniversalMidleware getter
        let r;
        try {
          r = m();
        } catch (e) {
          throw new Error("PhotonError: Ensure that all photon middlewares are wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance", { cause: e })
        }
        if (r instanceof Promise) {
          r.catch(e => {
            throw new Error("PhotonError: Ensure that all photon middlewares are wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance", { cause: e })
          });
          throw new Error("PhotonError: Ensure that all photon middlewares are wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance");
        }
        return r;
      }
      // TODO else
    })
    .flat(Number.POSITIVE_INFINITY);
}

export function getUniversalEntries() {
  return [${universalEntries.map((_, i) => `u${i}`).join(', ')}]
    .flat(Number.POSITIVE_INFINITY);
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
