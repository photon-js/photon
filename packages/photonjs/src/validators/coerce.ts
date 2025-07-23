import { asPhotonEntryId } from '../plugin/utils/virtual.js'
import type { Photon } from '../types.js'
import { assert } from '../utils/assert.js'
import type { PhotonConfig, PhotonEntryPartial, PhotonEntryServerPartial } from './types.js'
import * as Validators from './validators.js'

export function entryToPhoton(
  defaultType: 'server-entry',
  entry: string | PhotonEntryServerPartial,
  name: 'index',
): Photon.EntryServer
export function entryToPhoton(
  defaultType: 'handler-entry',
  entry: string | PhotonEntryPartial,
  name: string,
): Photon.EntryUniversalHandler | Photon.EntryServerConfig
export function entryToPhoton(
  defaultType: 'server-entry' | 'handler-entry',
  entry: string | PhotonEntryServerPartial | PhotonEntryPartial,
  name: string,
): Photon.Entry {
  assert(name)
  if (typeof entry === 'string') {
    return {
      id: asPhotonEntryId(entry, defaultType),
      name,
      type: defaultType === 'server-entry' ? 'server' : 'universal-handler',
    }
  }
  if (entry.type === 'server-config' || entry.id === 'photon:server-entry' || !entry.id) {
    return {
      ...entry,
      id: 'photon:server-entry',
      type: 'server-config',
      name,
    }
  }
  return {
    ...entry,
    id: asPhotonEntryId(entry.id, defaultType),
    type: defaultType === 'server-entry' ? 'server' : 'universal-handler',
    name,
  }
}

function entriesToPhoton(
  entries: PhotonConfig['entries'],
): (Photon.EntryUniversalHandler | Photon.EntryServerConfig)[] {
  return Object.entries(entries ?? {}).map(([key, value]) => entryToPhoton('handler-entry', value, key))
}

function excludeTrue<T>(v: T): Partial<Exclude<T, true>> {
  if (v === true) return {}
  return v as Exclude<T, true>
}

const resolver = Validators.PhotonConfig.transform((c) => {
  return Validators.PhotonConfigResolved.parse({
    // Allows Photon targets to add custom options
    ...c,
    entries: entriesToPhoton(c.entries),
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
    devServer:
      c.devServer === false
        ? false
        : {
            env: excludeTrue(c.devServer)?.env ?? 'ssr',
            autoServe: excludeTrue(c.devServer)?.autoServe ?? true,
          },
    middlewares: c.middlewares ?? [],
    codeSplitting: c.codeSplitting ?? true,
    hmr: c.hmr ?? true,
  })
})

export function resolvePhotonConfig(config: PhotonConfig | undefined): Photon.ConfigResolved {
  return resolver.parse(config ?? {})
}
