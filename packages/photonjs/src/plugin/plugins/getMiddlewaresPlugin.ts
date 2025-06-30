import type { Plugin } from 'vite'
import type { PluginContext } from '../utils/rollupTypes.js'
import { ifPhotonModule } from '../utils/virtual.js'

function getAllPhotonMiddlewares(pluginContext: PluginContext, condition: 'dev' | 'edge' | 'node', server: string) {
  const isDev = condition === 'dev'
  const isDevServer = Boolean(pluginContext.environment.config.photon.devServer)
  // Dev handlers and middlewares can be injected by a dedicated vite devServer middleware.
  // If this is the case, we shouldn't try to inject them into the server's runtime.
  const areMiddlewaresAlreadyInstalledByViteDevServer = isDev && isDevServer
  const defaultBuildEnv = pluginContext.environment.config.photon.defaultBuildEnv || 'ssr'
  const currentEnv = pluginContext.environment.name

  // middlewares
  const getMiddlewares = areMiddlewaresAlreadyInstalledByViteDevServer
    ? []
    : (pluginContext.environment.config.photon.middlewares ?? [])
  const middlewares = getMiddlewares
    .map((m) => m.call(pluginContext, condition, server))
    .filter((x) => typeof x === 'string' || Array.isArray(x))
    .flat(1)

  // handlers
  const handlers = areMiddlewaresAlreadyInstalledByViteDevServer ? {} : pluginContext.environment.config.photon.handlers
  let universalEntries = Object.values(handlers)
  if (!isDev) {
    // Only inject entries for the current environment
    universalEntries = universalEntries.filter((h) => (h.env || defaultBuildEnv) === currentEnv)
  }
  const universalEntriesIds = universalEntries.map((e) => e.id)

  //language=javascript
  return `
import { getUniversal, nameSymbol } from 'photon:resolve-from-photon:@universal-middleware/core';
import { PhotonConfigError } from 'photon:resolve-from-photon:@photonjs/core/errors';
${middlewares.map((m, i) => `import m${i} from ${JSON.stringify(m)};`).join('\n')}
${universalEntriesIds.map((m, i) => `import u${i} from ${JSON.stringify(m)};`).join('\n')}

function errorMessageMiddleware(id) {
  return \`"\${id}" default export must respect the following type: UniversalMiddleware | UniversalMiddleware[]. Each individual middleware must be wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance\`
}

function errorMessageEntry(id) {
  return \`"\${id}" default export must respect the following type: UniversalHandler. Make sure this entry have a route defined through Photon config or through enhance helper (https://universal-middleware.dev/helpers/enhance)\`
}

export function extractUniversal(mi, id, errorMessage) {
  return [mi]
    .flat(Number.POSITIVE_INFINITY)
    .map(getUniversal)
    .map((m, i) => {
      if (typeof m === 'function' && nameSymbol in m) {
        return m;
      }
      throw new PhotonConfigError(errorMessage(id, i));
    }
  );
}

export function getUniversalMiddlewares() {
  return [${middlewares.map((m, i) => `extractUniversal(m${i}, ${JSON.stringify(m)}, errorMessageMiddleware)`).join(', ')}].flat(1);
}

export function getUniversalEntries() {
  return [${universalEntriesIds.map((m, i) => `extractUniversal(u${i}, ${JSON.stringify(m)}, errorMessageEntry)`).join(', ')}].flat(1);
}
`
}

export function getMiddlewaresPlugin(): Plugin[] {
  return [
    {
      name: 'photon:get-middlewares',

      async resolveId(id) {
        return ifPhotonModule('get-middlewares', id, () => ({
          id,
          moduleSideEffects: false,
        }))
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
