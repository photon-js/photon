import type { z } from 'zod/v4'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'
import type { Photon } from '../types.js'
import { assert } from '../utils/assert.js'
import type { PhotonConfig, PhotonEntryServerPartial, PhotonEntryUniversalHandlerPartial } from './types.js'
import * as Validators from './validators.js'

function entryToPhoton(
  type: 'server-entry',
  entry: string | PhotonEntryServerPartial,
  name: 'index',
): Photon.EntryServer
function entryToPhoton(
  type: 'handler-entry',
  entry: string | PhotonEntryUniversalHandlerPartial,
  name: string,
): Photon.EntryUniversalHandler
function entryToPhoton(
  type: 'server-entry' | 'handler-entry',
  entry: string | PhotonEntryServerPartial | PhotonEntryUniversalHandlerPartial,
  name: string,
): Photon.Entry {
  assert(name)
  if (typeof entry === 'string') {
    return {
      id: asPhotonEntryId(entry, type),
      name,
      type: type === 'server-entry' ? 'server' : 'universal-handler',
    }
  }
  return {
    ...entry,
    type: type === 'server-entry' ? 'server' : 'universal-handler',
    name,
    id: asPhotonEntryId(entry.id, type),
  }
}

function handlersToPhoton(
  handlers: z.infer<typeof Validators.PhotonConfig>['handlers'],
): Record<string, Photon.EntryUniversalHandler> {
  return Object.fromEntries(
    Object.entries(handlers ?? {}).map(([key, value]) => [
      key,
      entryToPhoton('handler-entry', value as Photon.EntryUniversalHandler, key),
    ]),
  )
}

function excludeTrue<T>(v: T): Partial<Exclude<T, true>> {
  if (v === true) return {}
  return v as Exclude<T, true>
}

const resolver = Validators.PhotonConfig.transform((c) => {
  return Validators.PhotonConfigResolved.parse({
    // Allows Photon targets to add custom options
    ...c,
    handlers: handlersToPhoton(c.handlers),
    server: c.server
      ? entryToPhoton('server-entry', c.server, 'index')
      : entryToPhoton(
          'server-entry',
          {
            id: 'photon:fallback-entry',
            type: 'server',
            server: 'hono',
          },
          'index',
        ),
    additionalServerConfigs: c.additionalServerConfigs ?? [],
    devServer:
      c.devServer === false
        ? false
        : {
            env: excludeTrue(c.devServer)?.env ?? 'ssr',
            autoServe: excludeTrue(c.devServer)?.autoServe ?? true,
          },
    middlewares: c.middlewares ?? [],
    hmr: c.hmr ?? true,
  })
})

export function resolvePhotonConfig(config: PhotonConfig | undefined): Photon.ConfigResolved {
  return resolver.parse(config ?? {})
}
