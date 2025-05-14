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

  //language=javascript
  return `
import { getUniversal, nameSymbol } from 'photon:resolve-from-photon:@universal-middleware/core';
${middlewares.map((m, i) => `import m${i} from ${JSON.stringify(m)};`).join('\n')}
${universalEntries.map((m, i) => `import u${i} from ${JSON.stringify(m)};`).join('\n')}

function errorMessageMiddleware(id) {
  return \`PhotonError: "\${id}" default export must respect the following type: UniversalMiddleware | UniversalMiddleware[]. Each individual middleware must be wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance\`
}

function errorMessageEntry(id) {
  return \`PhotonError: "\${id}" default export must respect the following type: UniversalHandler. Make sure this entry have a route defined through Photon config or through enhance helper (https://universal-middleware.dev/helpers/enhance)\`
}

export function extractUniversal(mi, id, errorMessage) {
  return [mi]
    .flat(Number.POSITIVE_INFINITY)
    .map(getUniversal)
    .map((m, i) => {
      if (typeof m === 'function' && nameSymbol in m) {
        return m;
      }
      throw new Error(errorMessage(id, i));
    }
  );
}

export function getUniversalMiddlewares() {
  return [${middlewares.map((m, i) => `extractUniversal(m${i}, ${JSON.stringify(m)}, errorMessageMiddleware)`).join(', ')}].flat(1);
}

export function getUniversalEntries() {
  return [${universalEntries.map((m, i) => `extractUniversal(u${i}, ${JSON.stringify(m)}, errorMessageEntry)`).join(', ')}].flat(1);
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
          return {
            code: getAllPhotonMiddlewares(this, id),
            map: { mappings: '' },
          }
        }
      },
    },
  ]
}
