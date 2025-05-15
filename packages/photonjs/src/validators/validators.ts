import { type } from 'arktype'
import type { PluginContext } from 'rollup'

// FIXME server should be optional?
export type GetPhotonCondition = (
  this: PluginContext,
  condition: 'dev' | 'edge' | 'node',
  server: string,
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
) => string | string[] | undefined | null | void

export const SupportedServers = type("'hono' | 'hattip' | 'elysia' | 'express' | 'fastify' | 'h3'")

export const PhotonEntryBase = type({
  id: 'string',
  'route?': 'string',
  'resolvedId?': 'string',
})

export const PhotonEntryServer = type({
  '...': PhotonEntryBase,
  type: "'server'",
  'server?': SupportedServers,
})

export const PhotonEntryUniversalHandler = type({
  '...': PhotonEntryBase,
  type: "'universal-handler'",
})

export const PhotonConfig = type({
  'handlers?': {
    '[string]': type('string').or(PhotonEntryUniversalHandler.partial()),
  },
  'server?': type('string').or(PhotonEntryServer.partial()),
  'hmr?': "boolean | 'prefer-restart'",
  'middlewares?': 'Array | undefined' as type.cast<GetPhotonCondition[]>,
  'devServer?': type('boolean').or({
    'autoServe?': 'boolean',
  }),
})

export const PhotonConfigResolved = type({
  handlers: {
    '[string]': PhotonEntryUniversalHandler,
  },
  server: PhotonEntryServer,
  hmr: "boolean | 'prefer-restart'",
  'middlewares?': 'Array' as type.cast<GetPhotonCondition[]>,
  'devServer?': type('boolean').or({
    'autoServe?': 'boolean',
  }),
})
