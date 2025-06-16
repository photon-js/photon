import type { ViteDevServer } from 'vite'
import { z } from 'zod/v4'
import type { PluginContext } from '../plugin/utils/rollupTypes.js'

// FIXME server should be optional?
export type GetPhotonCondition = (
  this: ViteDevServer | PluginContext,
  condition: 'dev' | 'edge' | 'node',
  server: string,
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
) => string | string[] | undefined | null | void

export const SupportedServers = z.enum(['hono', 'hattip', 'elysia', 'express', 'fastify', 'h3'])

export const PhotonEntryBase = z.object({
  id: z.string(),
  route: z.string().optional(),
  resolvedId: z.string().optional(),
})

export const PhotonEntryServer = PhotonEntryBase.extend({
  type: z.literal('server'),
  server: SupportedServers.optional(),
})

export const PhotonEntryUniversalHandler = PhotonEntryBase.extend({
  type: z.literal('universal-handler'),
  /**
   * If false or undefined, the server will wrap this handler.
   * If true, adapters can choose to deploy it directly (usually on edge platforms).
   */
  standalone: z.boolean().optional(),
  env: z.string().optional(),
})

export const PhotonConfig = z.looseObject({
  handlers: z.record(z.string(), z.union([z.string(), PhotonEntryUniversalHandler.partial()])).optional(),
  server: z.union([z.string(), PhotonEntryServer.partial()]).optional(),
  hmr: z.union([z.boolean(), z.literal('prefer-restart')]).optional(),
  middlewares: z
    .array(
      z.custom<GetPhotonCondition>((fn) => {
        return typeof fn === 'function'
      }),
    )
    .optional(),
  devServer: z
    .union([
      z.boolean(),
      z.object({
        env: z.string().optional(),
        autoServe: z.boolean().optional(),
      }),
    ])
    .optional(),
})

export const PhotonConfigResolved = z.looseObject({
  handlers: z.record(z.string(), PhotonEntryUniversalHandler),
  server: PhotonEntryServer,
  hmr: z.union([z.boolean(), z.literal('prefer-restart')]),
  middlewares: z.array(
    z.custom<GetPhotonCondition>((fn) => {
      return typeof fn === 'function'
    }),
  ),
  devServer: z.union([
    z.literal(false),
    z.object({
      env: z.string(),
      autoServe: z.boolean(),
    }),
  ]),
})
