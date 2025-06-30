import type { ViteDevServer } from 'vite'
import { z } from 'zod/v4'
import type { PluginContext } from '../plugin/utils/rollupTypes.js'

// FIXME should server be optional?
export type GetPhotonCondition = (
  this: ViteDevServer | PluginContext,
  condition: 'dev' | 'edge' | 'node',
  server: string,
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
) => string | string[] | undefined | null | void

export const SupportedServers = z.enum(['hono', 'hattip', 'elysia', 'express', 'fastify', 'h3'])

export const PhotonEntryBase = z.looseObject({
  id: z.string(),
  name: z.string(),
  route: z.string().optional(),
  resolvedId: z.string().optional(),
})

export const PhotonEntryServer = PhotonEntryBase.extend({
  type: z.literal('server'),
  server: SupportedServers.optional(),
})

export const PhotonEntryServerPartial = PhotonEntryServer.extend({
  type: PhotonEntryServer.shape.type.optional(),
}).omit({
  name: true,
})

export const PhotonEntryUniversalHandler = PhotonEntryBase.extend({
  type: z.literal('universal-handler'),
  // TODO should be moved to a new { node: { standalone: ...} } prop
  /**
   * If false or undefined, the server will wrap this handler.
   * If true, adapters can choose to deploy it directly (usually on edge platforms).
   */
  standalone: z.boolean().optional(),
  env: z.string().optional(),
})

export const PhotonEntryUniversalHandlerPartial = PhotonEntryUniversalHandler.extend({
  type: PhotonEntryUniversalHandler.shape.type.optional(),
}).omit({
  name: true,
})

export const PhotonConfig = z.looseObject({
  handlers: z.record(z.string(), z.union([z.string(), PhotonEntryUniversalHandlerPartial])).optional(),
  server: z.union([z.string(), PhotonEntryServerPartial]).optional(),
  /**
   * Allows for different deployment environments to generate code according to their specific requirements.
   * For instance, Vercel can use this information to create separate configurations for each `additionalServerConfigs`.
   */
  additionalServerConfigs: z.array(PhotonEntryBase.omit({ id: true, resolvedId: true })).optional(),
  hmr: z.union([z.boolean(), z.literal('prefer-restart')]).optional(),
  middlewares: z
    .array(
      z.custom<GetPhotonCondition>((fn) => {
        return typeof fn === 'function'
      }),
    )
    .optional(),
  defaultBuildEnv: z.string().optional(),
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
  additionalServerConfigs: z.array(PhotonEntryBase.omit({ id: true, resolvedId: true })),
  hmr: z.union([z.boolean(), z.literal('prefer-restart')]),
  middlewares: z.array(
    z.custom<GetPhotonCondition>((fn) => {
      return typeof fn === 'function'
    }),
  ),
  defaultBuildEnv: z.string().optional(),
  devServer: z.union([
    z.literal(false),
    z.object({
      env: z.string(),
      autoServe: z.boolean(),
    }),
  ]),
})
