import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import type { Plugin } from 'vite'
import { assert, assertUsage } from '../../utils/assert.js'
import { getPhotonMeta } from '../../utils/meta.js'
import { resolvePhotonConfig } from '../../validators/coerce.js'
import type { SupportedServers } from '../../validators/types.js'
import { singleton } from '../utils/dedupe.js'
import { isPhotonMeta } from '../utils/entry.js'
import type { ModuleInfo, PluginContext } from '../utils/rollupTypes.js'
import { importsToServer } from '../utils/servers.js'
import { asPhotonEntryId, ifPhotonModule, virtualModulesRegex } from '../utils/virtual.js'

const serverImports = new Set(Object.keys(importsToServer))
const re_photonHandler = /[?&]photonHandler=/

function computePhotonMetaServer(
  pluginContext: PluginContext,
  resolvedIdsToServers: Record<string, SupportedServers>,
  info: ModuleInfo,
) {
  assertUsage(!info.isExternal, `Entry should not be external: ${info.id}`)
  // early return for better performance
  if (
    isPhotonMeta(info.meta) &&
    info.meta.photon.type &&
    (info.meta.photon.type !== 'server' || info.meta.photon.server)
  )
    return
  const graph = new Set([...info.importedIdResolutions, ...info.dynamicallyImportedIdResolutions])

  let found: SupportedServers | undefined
  for (const imported of graph.values()) {
    found = resolvedIdsToServers[imported.id]
    if (found) break
    if (imported.external) continue
    const sub = pluginContext.getModuleInfo(imported.id)
    if (sub) {
      for (const imp of [...sub.importedIdResolutions, ...sub.dynamicallyImportedIdResolutions]) {
        graph.add(imp)
      }
    }
  }

  const serverEntry = pluginContext.environment.config.photon.server

  if (found) {
    if (!info.hasDefaultExport) {
      // TODO better error message with link to documentation
      pluginContext.error(`Entry "${info.id}" seems to use "${found}", but no default export was found`)
    }

    serverEntry.server = found

    assert(isPhotonMeta(info.meta))
    // Already assigned by ref by photon:resolve-entry-meta
    assert(info.meta.photon === serverEntry)
  } else {
    // TODO better error message with link to documentation
    pluginContext.error(`Cannot guess "${info.id}" server type. Make sure to use "@photonjs/<server>" package`)
  }
}

const resolvedIdsToServers: Record<string, SupportedServers> = {}
export function photonEntry(): Plugin[] {
  return [
    singleton({
      name: 'photon:set-input',
      apply: 'build',
      enforce: 'post',

      applyToEnvironment(env) {
        return env.config.consumer === 'server'
      },

      config: {
        order: 'post',
        handler(config) {
          const { server } = resolvePhotonConfig(config.photon)

          return {
            environments: {
              ssr: {
                build: {
                  rollupOptions: {
                    input: { index: server.id },
                  },
                },
              },
            },
          }
        },
      },

      sharedDuringBuild: true,
    }),
    singleton({
      name: 'photon:compute-meta',
      apply: 'build',
      enforce: 'pre',

      applyToEnvironment(env) {
        return env.config.consumer === 'server'
      },

      async resolveId(id, importer, opts) {
        if (id in importsToServer) {
          const resolved = await this.resolve(id, importer, opts)
          if (resolved) {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            resolvedIdsToServers[resolved.id] = importsToServer[id]!
          }
        }
      },

      moduleParsed: {
        order: 'pre',
        handler(info) {
          if (isPhotonMeta(info.meta) && info.meta.photon.type === 'server') {
            // Must be kept synchronous
            computePhotonMetaServer(this, resolvedIdsToServers, info)
          }
        },
      },

      sharedDuringBuild: true,
    }),
    singleton({
      name: 'photon:resolve-importer',
      enforce: 'pre',

      resolveId: {
        order: 'post',
        handler(id, importer, opts) {
          return ifPhotonModule(['handler-entry', 'server-entry'], importer, ({ entry }) => {
            if (entry) {
              return this.resolve(id, entry, {
                ...opts,
                skipSelf: false,
              })
            }
          })
        },
      },
      sharedDuringBuild: true,
    }),
    singleton({
      name: 'photon:resolve-server-with-handler',
      enforce: 'pre',

      resolveId: {
        filter: {
          id: virtualModulesRegex['server-entry-with-handler'],
        },
        order: 'post',
        handler(id) {
          return ifPhotonModule('server-entry-with-handler', id, async ({ handler }) => {
            const metaHandler = await getPhotonMeta(this, handler, 'handler-entry')

            return {
              id,
              meta: {
                photon: {
                  ...this.environment.config.photon.server,
                  // Additional handler meta take precedence
                  ...metaHandler,
                  type: 'server',
                  id,
                  resolvedId: id,
                },
              },
              resolvedBy: 'photon',
            }
          })
        },
      },

      load: {
        filter: {
          id: virtualModulesRegex['server-entry-with-handler'],
        },
        handler(id) {
          return ifPhotonModule('server-entry-with-handler', id, async ({ condition, handler }) => {
            const resolved = await this.resolve(this.environment.config.photon.server.id, undefined, {
              isEntry: true,
            })
            assert(resolved)

            const loaded = await this.load({ id: resolved.id })
            assert(loaded.code)

            const code = loaded.code

            const ast = this.parse(code)
            const magicString = new MagicString(code)

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
                    const { end } = node.source as unknown as { start: number; end: number }

                    // Adding a query parameter that will be used to rewrite `photon:get-middlewares` imports
                    magicString.appendRight(end - 1, `?${new URLSearchParams({ photonHandler: handler }).toString()}`)
                  }
                }
              },
            })

            return {
              code: magicString.toString(),
              map: magicString.generateMap(),
            }
          })
        },
      },

      sharedDuringBuild: true,
    }),
    singleton({
      name: 'photon:transform-get-middlewares-import',
      enforce: 'pre',

      resolveId: {
        filter: {
          id: re_photonHandler,
        },
        async handler(id, importer, opts) {
          const [actualId, query] = id.split('?')
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const resolved = await this.resolve(actualId!, importer, opts)
          assert(resolved)

          return {
            id: `${resolved.id}?${query}`,
            resolvedBy: 'photon',
          }
        },
      },

      load: {
        filter: {
          id: re_photonHandler,
        },
        async handler(id) {
          const [actualId, query] = id.split('?')
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          const loaded = await this.load({ id: actualId! })
          assert(loaded.code)

          const handlerId = new URLSearchParams(query).get('photonHandler')
          assert(handlerId)

          return {
            code: loaded.code.replace(
              virtualModulesRegex['get-middlewares'],
              `photon:get-middlewares:$<condition>:$<server>:${handlerId}`,
            ),
            map: { mappings: '' },
          }
        },
      },
    }),
    singleton({
      name: 'photon:resolve-server',
      enforce: 'pre',

      resolveId: {
        filter: {
          id: virtualModulesRegex['server-entry'],
        },
        order: 'post',
        handler(id, _importer, opts) {
          return ifPhotonModule('server-entry', id, async ({ entry: actualId }) => {
            const entry = this.environment.config.photon.server

            if (!actualId) {
              return this.resolve(this.environment.config.photon.server.id, undefined, {
                isEntry: true,
                custom: {
                  setPhotonMeta: entry,
                },
              })
            }

            const resolved = await this.resolve(actualId, undefined, {
              ...opts,
              isEntry: true,
              skipSelf: false,
              custom: {
                setPhotonMeta: entry,
              },
            })

            assertUsage(resolved, `Cannot resolve ${actualId} to a server entry`)

            entry.resolvedId = resolved.id

            // Ensure early resolution of photon meta during build
            if (this.environment.config.command === 'build') {
              await this.load({ ...resolved, resolveDependencies: true })
            }

            return {
              ...resolved,
              meta: {
                photon: entry,
              },
              resolvedBy: 'photon',
            }
          })
        },
      },
      sharedDuringBuild: true,
    }),
    singleton({
      name: 'photon:resolve-handler',
      enforce: 'pre',

      resolveId: {
        filter: {
          id: virtualModulesRegex['handler-entry'],
        },
        order: 'post',
        handler(id, _importer, opts) {
          return ifPhotonModule('handler-entry', id, async ({ entry: actualId }) => {
            const idWithPhotonPrefix = asPhotonEntryId(id, 'handler-entry')
            let entry = Object.values(this.environment.config.photon.handlers).find(
              (e) => asPhotonEntryId(e.id, 'handler-entry') === idWithPhotonPrefix,
            )

            let resolved = await this.resolve(actualId, undefined, {
              ...opts,
              isEntry: true,
              skipSelf: false,
              custom: {
                setPhotonMeta: entry,
              },
            })

            // Try to resolve by handler key
            if (!resolved && actualId in this.environment.config.photon.handlers) {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              resolved = await this.resolve(this.environment.config.photon.handlers[actualId]!.id, undefined, {
                ...opts,
                isEntry: true,
                skipSelf: false,
                custom: {
                  setPhotonMeta: entry,
                },
              })
            }

            assertUsage(resolved, `Cannot resolve ${actualId} to a handler entry`)

            if (!entry) {
              const resolvedIdWithPhotonPrefix = asPhotonEntryId(resolved.id, 'handler-entry')
              entry = Object.values(this.environment.config.photon.handlers).find(
                (e) => e.id === resolvedIdWithPhotonPrefix,
              )
            }

            assertUsage(entry, `Cannot find a handler for ${resolved.id}`)
            entry.resolvedId = resolved.id

            // Ensure early resolution of photon meta during build
            if (this.environment.config.command === 'build') {
              await this.load({ ...resolved, resolveDependencies: true })
            }

            return {
              ...resolved,
              meta: {
                photon: entry,
              },
              resolvedBy: 'photon',
            }
          })
        },
      },
      sharedDuringBuild: true,
    }),
    singleton({
      name: 'photon:resolve-server-with-config',
      enforce: 'pre',

      resolveId: {
        filter: {
          id: virtualModulesRegex['server-entry-with-config'],
        },
        order: 'post',
        handler(id) {
          return ifPhotonModule('server-entry-with-config', id, async ({ config }) => {
            const configKey = Number.parseInt(config)
            assertUsage(!Number.isNaN(configKey), `Config key should be a number, was ${config}`)

            const configValue = this.environment.config.photon.additionalServerConfigs[configKey]
            assertUsage(configValue, `Unknown config key ${config}`)

            const meta = await getPhotonMeta(this, this.environment.config.photon.server.id)

            return {
              id,
              meta: {
                photon: {
                  ...meta,
                  resolvedId: id,
                  ...configValue,
                  id,
                },
              },
              resolvedBy: 'photon',
            }
          })
        },
      },

      load: {
        filter: {
          id: virtualModulesRegex['server-entry-with-config'],
        },
        handler(id) {
          return ifPhotonModule('server-entry-with-config', id, async () => {
            const resolved = await this.resolve(this.environment.config.photon.server.id, undefined, {
              isEntry: true,
            })
            assert(resolved)

            const loaded = await this.load({ id: resolved.id })
            assert(loaded.code)

            return {
              code: loaded.code,
            }
          })
        },
      },

      sharedDuringBuild: true,
    }),
    singleton({
      name: 'photon:trickle-meta',
      enforce: 'pre',

      async resolveId(id, imports, opts) {
        if (opts.custom?.setPhotonMeta) {
          const resolved = await this.resolve(id, imports, opts)

          if (!resolved) return

          return {
            ...resolved,
            meta: {
              ...resolved.meta,
              photon: opts.custom.setPhotonMeta,
            },
          }
        }
      },
    }),
  ]
}
