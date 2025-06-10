import { type } from 'arktype'
import type { ViteDevServer } from 'vite'
import type { PluginContext } from '../plugin/utils/rollupTypes.js'

// FIXME server should be optional?
export type GetPhotonCondition = (
  this: ViteDevServer | PluginContext,
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
  /**
   * If false or undefined, the server will wrap this handler.
   * If true, adapters can choose to deploy it directly (usually on edge platforms).
   */
  'standalone?': 'boolean',
  'env?': 'string',
})

export const PhotonConfig = type({
  'handlers?': {
    '[string]': type('string').or(PhotonEntryUniversalHandler.partial()),
  },
  'server?': type('string').or(PhotonEntryServer.partial()),
  'hmr?': "boolean | 'prefer-restart'",
  'middlewares?': 'Array | undefined' as type.cast<GetPhotonCondition[]>,
  'devServer?': type('boolean').or({
    'env?': 'string',
    'autoServe?': 'boolean',
  }),
})

export const PhotonConfigResolved = type({
  handlers: {
    '[string]': PhotonEntryUniversalHandler,
  },
  server: PhotonEntryServer,
  hmr: "boolean | 'prefer-restart'",
  middlewares: 'Array' as type.cast<GetPhotonCondition[]>,
  devServer: type('false').or({
    env: 'string',
    autoServe: 'boolean',
  }),
})
