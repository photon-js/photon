import type { PluginContext } from 'rollup'
import type { Plugin } from 'vite'
import { ifPhotonModule } from '../utils/virtual.js'

function getAllPhotonMiddlewares(pluginContext: PluginContext, condition: 'dev' | 'edge' | 'node', server: string) {
  const handlers = pluginContext.environment.config.photon.handlers
  // non-index entries are always considered Universal Handlers
  const universalEntries = Object.values(handlers).map((e) => e.id)

  const getMiddlewares = pluginContext.environment.config.photon.middlewares ?? []
  const middlewares = getMiddlewares
    .map((m) => m.call(pluginContext, condition, server))
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
        return ifPhotonModule('get-middlewares', id, () => id)
      },

      load(id) {
        return ifPhotonModule('get-middlewares', id, ({ condition, server }) => {
          return {
            code: getAllPhotonMiddlewares(this, condition as 'dev' | 'edge' | 'node', server),
            map: { mappings: '' } as const,
          }
        })
      },
    },
  ]
}
