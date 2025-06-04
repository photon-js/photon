import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import type { Plugin } from 'vite'
import { isPhotonMeta } from '../../api.js'
import { assert, assertUsage } from '../../utils/assert.js'
import { importsToServer } from '../utils/servers.js'
import { ifPhotonModule } from '../utils/virtual.js'

export { virtualApplyHandler }

const rePhotonHandlerId = /[?&]photonHandlerId=/
const serverImports = new Set(Object.keys(importsToServer))

function virtualApplyHandler(): Plugin[] {
  return [
    {
      name: 'photon:virtual-apply-handler',

      resolveId(id) {
        return ifPhotonModule('virtual-apply-handler', id, () => {
          return id
        })
      },

      load(id) {
        return ifPhotonModule('virtual-apply-handler', id, ({ handler: handlerId, condition, server }) => {
          const handlers = this.environment.config.photon.handlers
          const handler = handlers[handlerId]
          assertUsage(handler, `Cannot find handler ${handlerId}`)

          const isAsync = server === 'fastify'

          // middlewares
          const getMiddlewares = this.environment.config.photon.middlewares ?? []
          const middlewares = handler.standalone
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
import handler from ${JSON.stringify(handler.id)};
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
  return extractUniversal(handler, ${JSON.stringify(handler.id)}, errorMessageEntry);
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
    {
      name: 'photon:replace-apply-by-virtual-apply-handler',

      transform: {
        filter: {
          id: [rePhotonHandlerId],
        },
        handler(code, id) {
          // Support for vite<6.3
          if (!id.match(rePhotonHandlerId)) return
          const info = this.getModuleInfo(id)

          // TODO support: { apply } could be called by a submodule
          if (isPhotonMeta(info?.meta) && info.meta.photon.type === 'server') {
            const ast = this.parse(code)
            const magicString = new MagicString(code)
            const q = new URLSearchParams(id.split('?')[1])
            const condition = q.get('photonCondition')
            const handlerId = q.get('photonHandlerId') as string
            assert(condition)

            walk(ast, {
              enter(node) {
                if (
                  node.type === 'ImportDeclaration' &&
                  typeof node.source.value === 'string' &&
                  serverImports.has(node.source.value)
                ) {
                  let foundApply = false
                  // Check if { apply } is among the imported specifiers
                  for (const specifier of node.specifiers) {
                    if (
                      specifier.type === 'ImportSpecifier' &&
                      specifier.imported &&
                      'name' in specifier.imported &&
                      specifier.imported.name === 'apply'
                    ) {
                      foundApply = true
                      break
                    }
                  }
                  if (foundApply) {
                    const { start, end } = node.source as unknown as { start: number; end: number }
                    const server = importsToServer[node.source.value] as string
                    magicString.overwrite(
                      start,
                      end,
                      JSON.stringify(`photon:virtual-apply-handler:${condition}:${server}:${handlerId}`),
                    )
                  }
                }
              },
            })

            return {
              code: magicString.toString(),
              map: magicString.generateMap(),
            }
          }
        },
      },
    },
  ]
}
