import { match, type } from 'arktype'
import { asPhotonEntryId } from '../plugin/utils/virtual.js'
import type {
  PhotonConfig,
  PhotonConfigResolved,
  PhotonEntryBase,
  PhotonEntryServer,
  PhotonEntryUniversalHandler,
} from './types.js'
import * as Validators from './validators.js'

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
  handlers: Record<string, Partial<PhotonEntryUniversalHandler> | string>,
): Record<string, PhotonEntryUniversalHandler> {
  return Object.fromEntries(
    Object.entries(handlers).map(([key, value]) => [
      key,
      entryToPhoton(value as PhotonEntryUniversalHandler, 'handler-entry'),
    ]),
  )
}

export function resolvePhotonConfig(config: PhotonConfig | undefined): PhotonConfigResolved {
  const out = Validators.PhotonConfig.pipe.try((c) => {
    const toRest = match
      .in<PhotonConfig>()
      .case({ '[string]': 'unknown' }, (v) => {
        const { handlers, server, hmr, middlewares, ...rest } = v
        return rest
      })
      .default(() => ({}))

    const handlers = handlersToPhoton(c.handlers ?? {})
    const server = c.server
      ? entryToPhoton(c.server, 'server-entry')
      : entryToPhoton(
          {
            id: 'photon:fallback-entry',
            type: 'server',
            server: 'hono',
          },
          'server-entry',
        )
    const hmr = c.hmr ?? true
    const middlewares = c.middlewares ?? []
    // Allows Photon targets to add custom options
    const rest = toRest(c)

    return {
      handlers,
      server,
      hmr,
      middlewares,
      ...rest,
    }
  }, Validators.PhotonConfigResolved)(config)

  if (out instanceof type.errors) return out.throw()
  return out
}
