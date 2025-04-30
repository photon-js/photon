import type { ModuleInfo, PluginContext } from 'rollup'
import type { Plugin } from 'vite'
import { assert, assertUsage } from '../../utils/assert.js'
import type { PhotonEntryServer, SupportedServers } from '../../validators/types.js'

import { resolvePhotonConfig } from '../../validators/coerce.js'
import {
  extractPhotonEntryId,
  includesPhotonEntryId,
  isPhotonEntryId,
  isPhotonMeta,
  stripPhotonEntryId,
} from '../utils/entry.js'

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
  if (isPhotonMeta(info.meta) && info.meta.photonjs.type && info.meta.photonjs.type !== 'auto') return
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

  const entry = Object.values(pluginContext.environment.config.photonjs.entry).find((e) => e.resolvedId === info.id)
  assert(entry)

  if (found) {
    if (!info.hasDefaultExport) {
      // TODO better error message with link to documentation
      pluginContext.error(`Entry "${info.id}" seems to use "${found}", but no default export was found`)
    }
    info.meta ??= {}
    info.meta.photonjs ??= {}
    info.meta.photonjs.type = 'server'
    info.meta.photonjs.server = found
    entry.type = info.meta.photonjs.type
    ;(entry as PhotonEntryServer).server = info.meta.photonjs.server
  } else if (info.hasDefaultExport) {
    info.meta.photonjs.type = 'universal-handler'
    entry.type = info.meta.photonjs.type
  } else {
    // TODO better error message with link to documentation
    pluginContext.error(
      `Cannot guess "${info.id}" entry type. Make sure to provide a default export, and if you use a server, use "@photonjs/<server>" package`,
    )
  }
}

export function photonEntry(): Plugin[] {
  const resolvedIdsToServers: Record<string, SupportedServers> = {}

  return [
    {
      name: 'photonjs:set-input',
      apply: 'build',
      enforce: 'post',

      applyToEnvironment(env) {
        return env.config.consumer === 'server'
      },

      config: {
        order: 'post',
        handler(config) {
          const { entry } = resolvePhotonConfig(config.photonjs)

          return {
            environments: {
              ssr: {
                build: {
                  rollupOptions: {
                    input: Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, value.id])),
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
      name: 'photonjs:compute-meta',
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

      moduleParsed(info) {
        if (isPhotonMeta(info.meta)) {
          // Must be kept sync
          computePhotonMeta(this, resolvedIdsToServers, info)
        }
      },

      sharedDuringBuild: true,
    },
    {
      // Some plugins, like @cloudflare/vite-plugin try to resolve the entry beforehand,
      // resulting in photon entries prefixed by cwd() or some other folder
      name: 'photonjs:clean-photon-entry',
      enforce: 'pre',

      resolveId: {
        order: 'pre',
        async handler(id, importer, opts) {
          if (includesPhotonEntryId(id)) {
            return this.resolve(extractPhotonEntryId(id), importer, opts)
          }
        },
      },
    },
    {
      name: 'photonjs:resolve-entry-meta',
      enforce: 'pre',

      resolveId: {
        order: 'post',
        async handler(id, importer, opts) {
          const resolved =
            importer && isPhotonEntryId(importer)
              ? await this.resolve(id, stripPhotonEntryId(importer), {
                  ...opts,
                  skipSelf: false,
                })
              : isPhotonEntryId(id)
                ? await this.resolve(stripPhotonEntryId(id), undefined, {
                    ...opts,
                    isEntry: true,
                    skipSelf: false,
                  })
                : null

          if (resolved) {
            if (isPhotonEntryId(id)) {
              // FIXME photonjs:entry:./server.ts and photonjs:entry:server.ts should point to the same entry
              const entry = Object.values(this.environment.config.photonjs.entry).find((e) => e.id === id)
              assert(entry)
              entry.resolvedId = resolved.id

              return {
                ...resolved,
                meta: {
                  photonjs: {
                    type: 'auto',
                  },
                },
                resolvedBy: 'photonjs',
              }
            }
            return resolved
          }
        },
      },
      sharedDuringBuild: true,
    },
  ]
}
