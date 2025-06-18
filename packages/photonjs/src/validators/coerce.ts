import type { z } from 'zod/v4'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'
import type { Photon } from '../types.js'
import { assert } from '../utils/assert.js'
import type { PhotonConfig } from './types.js'
import * as Validators from './validators.js'

function entryToPhoton(
  type: 'server-entry',
  entry: string | Partial<Photon.EntryServer>,
  name: 'index',
): Photon.EntryServer
function entryToPhoton(
  type: 'handler-entry',
  entry: string | Partial<Photon.EntryUniversalHandler>,
  name: string,
): Photon.EntryUniversalHandler
function entryToPhoton(
  type: 'server-entry' | 'handler-entry',
  entry: string | Partial<Photon.Entry>,
  name: string,
): Photon.Entry {
  assert(name)
  if (typeof entry === 'string') {
    return {
      id: asPhotonEntryId(entry, type),
      name,
      type: type === 'server-entry' ? 'server' : 'universal-handler',
    } as Photon.Entry
  }
  return {
    ...entry,
    type: type === 'server-entry' ? 'server' : 'universal-handler',
    name,
    id: asPhotonEntryId((entry as Photon.EntryBase).id, type),
  } as Photon.Entry
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
      ? entryToPhoton('server-entry', c.server as Partial<Photon.EntryServer>, 'index')
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
