import type { z } from 'zod/v4'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'
import type { PhotonConfig, PhotonEntryBase, PhotonEntryServer, PhotonEntryUniversalHandler } from './types.js'
import * as Validators from './validators.js'
import type { Photon } from "../types.js";

function entryToPhoton<
  T extends 'handler-entry' | 'server-entry',
  Entry = T extends 'server-entry' ? PhotonEntryServer : PhotonEntryUniversalHandler,
>(entry: string | Entry, type: T): Entry {
  if (typeof entry === 'string')
    return {
      id: asPhotonEntryId(entry, type),
      type: type === 'server-entry' ? 'server' : 'universal-handler',
    } as Entry
  return {
    ...entry,
    type: type === 'server-entry' ? 'server' : 'universal-handler',
    id: asPhotonEntryId((entry as PhotonEntryBase).id, type),
  }
}

function handlersToPhoton(
  handlers: z.infer<typeof Validators.PhotonConfig>['handlers'],
): Record<string, PhotonEntryUniversalHandler> {
  return Object.fromEntries(
    Object.entries(handlers ?? {}).map(([key, value]) => [
      key,
      entryToPhoton(value as PhotonEntryUniversalHandler, 'handler-entry'),
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
      ? entryToPhoton(c.server, 'server-entry')
      : entryToPhoton(
          {
            id: 'photon:fallback-entry',
            type: 'server',
            server: 'hono',
          },
          'server-entry',
        ),
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
