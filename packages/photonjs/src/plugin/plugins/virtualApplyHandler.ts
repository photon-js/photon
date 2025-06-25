import type { Plugin } from 'vite'
import { getPhotonMeta } from '../../utils/meta.js'
import { ifPhotonModule } from '../utils/virtual.js'

export { virtualApplyHandler }

function virtualApplyHandler(): Plugin[] {
  return [
    {
      name: 'photon:virtual-apply-handler',

      resolveId(id) {
        return ifPhotonModule('virtual-apply-handler', id, () => {
          return {
            id,
            moduleSideEffects: false,
          }
        })
      },

      load(id) {
        return ifPhotonModule('virtual-apply-handler', id, async ({ handler: handlerId, condition, server }) => {
          const metaHandler = await getPhotonMeta(this, handlerId, 'handler-entry')

          const isAsync = server === 'fastify'

          // middlewares
          const getMiddlewares = this.environment.config.photon.middlewares ?? []
          const middlewares = metaHandler.standalone
            ? []
            : getMiddlewares
                .map((m) => m.call(this, condition as 'dev' | 'node' | 'edge', server))
                .filter((x) => typeof x === 'string' || Array.isArray(x))
                .flat(1)

          return {
            // TODO refactor and share code with get-middlewares and virtual-apply
            //language=ts
            code: `
import { PhotonConfigError } from 'photon:resolve-from-photon:@photonjs/core/errors';
import { apply as applyAdapter } from 'photon:resolve-from-photon:@universal-middleware/${server}';
import { getUniversal, getUniversalProp, nameSymbol } from 'photon:resolve-from-photon:@universal-middleware/core';
import handler from ${JSON.stringify(metaHandler.id)};
${condition === 'dev' ? 'import { devServerMiddleware } from "photon:resolve-from-photon:@photonjs/core/dev";' : ''}
${middlewares.map((m, i) => `import m${i} from ${JSON.stringify(m)};`).join('\n')}

function errorMessageMiddleware(id) {
  return \`"\${id}" default export must respect the following type: UniversalMiddleware | UniversalMiddleware[]. Each individual middleware must be wrapped with enhance helper. See https://universal-middleware.dev/helpers/enhance\`
}

function errorMessageEntry(id) {
  return \`"\${id}" default export must respect the following type: UniversalHandler. Make sure this entry have a route defined through Photon config or through enhance helper (https://universal-middleware.dev/helpers/enhance)\`
}

function extractUniversal(mi, id, errorMessage) {
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

function getUniversalMiddlewares() {
  return [${middlewares.map((m, i) => `extractUniversal(m${i}, ${JSON.stringify(m)}, errorMessageMiddleware)`).join(', ')}].flat(1);
}

function getUniversalEntries() {
  return extractUniversal(handler, ${JSON.stringify(metaHandler.id)}, errorMessageEntry);
}
  
export ${isAsync ? 'async' : ''} function apply(app, additionalMiddlewares) {
  const middlewares = getUniversalMiddlewares();
  const entries = getUniversalEntries();
  ${condition === 'dev' ? 'middlewares.unshift(devServerMiddleware());' : ''}
  
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

  app[Symbol.for('photon:server')] = ${JSON.stringify(server)};

  return app;
}

export { serve } from 'photon:resolve-from-photon:@photonjs/core/${server}/serve'
`,
            map: { mappings: '' } as const,
          }
        })
      },
    },
  ]
}
