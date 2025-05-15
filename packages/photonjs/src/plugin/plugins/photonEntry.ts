import type { ModuleInfo, PluginContext } from 'rollup'
import type { Plugin } from 'vite'
import { assert, assertUsage } from '../../utils/assert.js'
import { resolvePhotonConfig } from '../../validators/coerce.js'
import type { SupportedServers } from '../../validators/types.js'
import { isPhotonMeta } from '../utils/entry.js'
import { ifPhotonModule } from '../utils/virtual.js'

const idsToServers: Record<string, SupportedServers> = {
  '@photonjs/hono': 'hono',
  '@photonjs/hattip': 'hattip',
  '@photonjs/express': 'express',
  '@photonjs/fastify': 'fastify',
  '@photonjs/h3': 'h3',
  '@photonjs/elysia': 'elysia',
  '@photonjs/core/hono': 'hono',
  '@photonjs/core/hattip': 'hattip',
  '@photonjs/core/express': 'express',
  '@photonjs/core/fastify': 'fastify',
  '@photonjs/core/h3': 'h3',
  '@photonjs/core/elysia': 'elysia',
}

function computePhotonMeta(
  pluginContext: PluginContext,
  resolvedIdsToServers: Record<string, SupportedServers>,
  info: ModuleInfo,
) {
  assertUsage(!info.isExternal, `Entry should not be external: ${info.id}`)
  // early return for better performance
  if (isPhotonMeta(info.meta) && info.meta.photon.type && info.meta.photon.type !== 'auto') return
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
          const { handlers } = resolvePhotonConfig(config.photon)

          return {
            environments: {
              ssr: {
                build: {
                  rollupOptions: {
                    input: Object.fromEntries(Object.entries(handlers).map(([key, value]) => [key, value.id])),
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
        if (id in idsToServers) {
          const resolved = await this.resolve(id, importer, opts)
          if (resolved) {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            resolvedIdsToServers[resolved.id] = idsToServers[id]!
          }
        }
      },

      moduleParsed: {
        order: 'pre',
        handler(info) {
          if (isPhotonMeta(info.meta) && info.meta.photon.type === 'server') {
            // Must be kept synchronous
            computePhotonMeta(this, resolvedIdsToServers, info)
          }
        },
      },

      sharedDuringBuild: true,
    },
    {
      name: 'photon:resolve-entry-meta',
      enforce: 'pre',

      resolveId: {
        order: 'post',
        handler(id, importer, opts) {
          return ifPhotonModule(
            ['handler-entry', 'server-entry'],
            importer,
            ({ entry }) =>
              this.resolve(id, entry, {
                ...opts,
                skipSelf: false,
              }),
            () =>
              ifPhotonModule(
                'server-entry',
                id,
                async ({ entry: actualId }) => {
                  const resolved = await this.resolve(actualId, undefined, {
                    ...opts,
                    isEntry: true,
                    skipSelf: false,
                  })

                  assertUsage(resolved, `Cannot resolve ${actualId} to a server entry`)

                  const entry = this.environment.config.photon.server
                  entry.resolvedId = resolved.id

                  return {
                    ...resolved,
                    meta: {
                      photon: entry,
                    },
                    resolvedBy: 'photon',
                  }
                },
                () =>
                  ifPhotonModule('handler-entry', id, async ({ entry: actualId }) => {
                    let resolved = await this.resolve(actualId, undefined, {
                      ...opts,
                      isEntry: true,
                      skipSelf: false,
                    })

                    // Try to resolve by handler key
                    if (!resolved && actualId in this.environment.config.photon.handlers) {
                      // biome-ignore lint/style/noNonNullAssertion: <explanation>
                      resolved = await this.resolve(this.environment.config.photon.handlers[actualId]!.id, undefined, {
                        ...opts,
                        isEntry: true,
                        skipSelf: false,
                      })
                    }

                    assertUsage(resolved, `Cannot resolve ${actualId} to a handler entry`)

                    const entry = Object.values(this.environment.config.photon.handlers).find((e) => e.id === id)

                    assertUsage(entry, `Cannot find a handler for ${resolved.id}`)
                    entry.resolvedId = resolved.id

                    return {
                      ...resolved,
                      meta: {
                        photon: entry,
                      },
                      resolvedBy: 'photon',
                    }
                  }),
              ),
          )
        },
      },
      sharedDuringBuild: true,
    },
  ]
}
