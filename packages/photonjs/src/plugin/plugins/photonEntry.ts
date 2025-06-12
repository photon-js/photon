import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import type { Plugin } from 'vite'
import { assert, assertUsage } from '../../utils/assert.js'
import { resolvePhotonConfig } from '../../validators/coerce.js'
import type { SupportedServers } from '../../validators/types.js'
import { isPhotonMeta } from '../utils/entry.js'
import type { ModuleInfo, PluginContext } from '../utils/rollupTypes.js'
import { importsToServer } from '../utils/servers.js'
import { asPhotonEntryId, ifPhotonModule } from '../utils/virtual.js'

const reVirtualApplyHandler = /photon:virtual-apply-handler:(dev|node|edge):(?<server>[^:]+):.*/
const serverImports = new Set(Object.keys(importsToServer))

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
    found =
      resolvedIdsToServers[imported.id] ||
      (imported.id.match(reVirtualApplyHandler)?.groups?.server as SupportedServers | undefined)
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
    {
      name: 'photon:set-input',
      apply: 'build',
      enforce: 'post',

      applyToEnvironment(env) {
        return env.config.consumer === 'server'
      },

      config: {
        order: 'post',
        handler(config) {
          const { handlers, server } = resolvePhotonConfig(config.photon)

          return {
            environments: {
              ssr: {
                build: {
                  rollupOptions: {
                    input: Object.assign(
                      // TODO make sure that handlers do not overwrite server entry name
                      { index: server.id },
                      Object.fromEntries(Object.entries(handlers).map(([key, value]) => [key, value.id])),
                    ),
                  },
                },
              },
            },
          }
        },
      },

      sharedDuringBuild: true,
    },
    {
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
    },
    {
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
    },
    {
      name: 'photon:resolve-server-with-handler',
      enforce: 'pre',

      resolveId: {
        order: 'post',
        handler(id, _importer, opts) {
          return ifPhotonModule('server-entry-with-handler', id, async ({ condition, handler }) => {
            const server = this.environment.config.photon.server

            // Ensures that the server is resolved before reading Photon meta
            await this.resolve(server.id, undefined, {
              ...opts,
              isEntry: true,
            })

            const infoServer = this.getModuleInfo(server.id)
            assert(isPhotonMeta(infoServer?.meta))

            // Ensures that the handler is resolved before reading Photon meta
            await this.resolve(handler, undefined, {
              isEntry: true,
            })

            const infoHandler = this.getModuleInfo(server.id)
            assert(isPhotonMeta(infoHandler?.meta))

            return {
              id,
              meta: {
                photon: {
                  ...infoServer.meta.photon,
                  // Additional handler meta take precedence
                  ...infoHandler.meta.photon,
                  id,
                  resolvedId: id,
                },
              },
              resolvedBy: 'photon',
            }
          })
        },
      },

      async load(id) {
        return ifPhotonModule('server-entry-with-handler', id, async ({ condition, handler }) => {
          const loaded = await this.load({ id: this.environment.config.photon.server.id })
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
                  const { start, end } = node.source as unknown as { start: number; end: number }
                  const server = importsToServer[node.source.value] as string
                  magicString.overwrite(
                    start,
                    end,
                    JSON.stringify(`photon:virtual-apply-handler:${condition}:${server}:${handler}`),
                  )
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

      sharedDuringBuild: true,
    },
    {
      name: 'photon:resolve-server',
      enforce: 'pre',

      resolveId: {
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
    },
    {
      name: 'photon:resolve-handler',
      enforce: 'pre',

      resolveId: {
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
    },
    {
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
    },
  ]
}
