import { match, type } from 'arktype'
import type { BuildOptions } from 'esbuild'
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
    id: asPhotonEntryId((entry as PhotonEntryBase).id, type),
  }
}

function handlersToPhoton(
  handlers: string | PhotonEntryUniversalHandler | Record<string, PhotonEntryUniversalHandler | string>,
): Record<string, PhotonEntryUniversalHandler> {
  return Object.fromEntries(
    Object.entries(handlers).map(([key, value]) => [key, entryToPhoton(value, 'handler-entry')]),
  )
}

export function resolvePhotonConfig(config: PhotonConfig | undefined): PhotonConfigResolved {
  const out = Validators.PhotonConfig.pipe.try((c) => {
    const toPhotonHandlers = match
      .in<PhotonConfig>()
      .at('handlers')
      .case({ '[string]': 'string' }, (v) => handlersToPhoton(v.handlers))
      .case({ '[string]': Validators.PhotonEntryUniversalHandler }, (v) => handlersToPhoton(v.handlers))
      .default(() => ({}))

    const toPhotonServer = match
      .in<PhotonConfig>()
      .at('server')
      .case('string', (v) => entryToPhoton(v.server, 'server-entry'))
      .case(Validators.PhotonEntryServer, (v) => entryToPhoton(v.server, 'server-entry'))
      .default(
        // Fallback to a simple Hono server for now for simplicity
        () =>
          entryToPhoton(
            {
              id: 'photon:fallback-entry',
              type: 'server',
              server: 'hono',
            },
            'server-entry',
          ),
      )

    const toHmr = match
      .in<PhotonConfig>()
      .case({ hmr: 'boolean | "prefer-restart"' }, (v) => v.hmr)
      .default(() => true)

    const toStandalone = match
      .in<PhotonConfig>()
      .case({ standalone: 'boolean' }, (v) => v.standalone)
      .case({ standalone: 'object' }, (v) => v.standalone as type.cast<Omit<BuildOptions, 'manifest'>>)
      .default(() => false)

    const toMiddlewares = match
      .in<PhotonConfig>()
      .case({ middlewares: 'object' }, (v) => v.middlewares)
      .default(() => [])

    const toRest = match
      .in<PhotonConfig>()
      .case({ '[string]': 'unknown' }, (v) => {
        const { entry, hmr, standalone, middlewares, ...rest } = v
        return rest
      })
      .default(() => ({}))

    const handlers = toPhotonHandlers(c)
    const server = toPhotonServer(c)
    const hmr = toHmr(c)
    const standalone = toStandalone(c)
    const middlewares = toMiddlewares(c)
    // Allows Photon targets to add custom options
    const rest = toRest(c)

    return {
      handlers,
      server,
      hmr,
      standalone,
      middlewares,
      ...rest,
    }
  }, Validators.PhotonConfigResolved)(config)

  if (out instanceof type.errors) return out.throw()
  return out
}
