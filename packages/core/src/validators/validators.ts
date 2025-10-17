import type { ViteDevServer } from "vite";
import * as z from "zod";
import type { PluginContext } from "../plugin/utils/rollupTypes.js";

// FIXME should server be optional?
export type GetPhotonCondition = (
  this: ViteDevServer | PluginContext,
  condition: "dev" | "edge" | "node",
  server: string,
  // biome-ignore lint/suspicious/noConfusingVoidType: prefer void
) => string | string[] | undefined | null | void;

export const SupportedServers = z.enum(["hono", "hattip", "elysia", "express", "fastify", "h3", "srvx"]);

export const PhotonEntryBase = z.object({
  id: z.string(),
  name: z.string(),
  target: z.string().optional(),
  route: z.string().optional(),
  resolvedId: z.string().optional(),
});

export const PhotonEntryServer = PhotonEntryBase.extend({
  type: z.literal("server"),
  server: SupportedServers.optional(),
}).loose();

export const PhotonEntryServerPartial = PhotonEntryServer.extend({
  type: PhotonEntryServer.shape.type.optional(),
})
  .omit({
    name: true,
  })
  .loose();

export const PhotonEntryUniversalHandler = PhotonEntryBase.extend({
  type: z.literal("universal-handler"),
  /**
   * If undefined or 'auto', all middlewares will be applied to it.
   * If 'isolated', no middlewares will be applied.
   * @alpha
   */
  compositionMode: z.enum(["isolated", "auto"]).optional(),
  env: z.string().optional(),
}).loose();

export const PhotonEntryServerConfig = PhotonEntryBase.extend({
  id: z.literal("photon:server-entry"),
  type: z.literal("server-config"),
  compositionMode: PhotonEntryUniversalHandler.shape.compositionMode,
  env: PhotonEntryUniversalHandler.shape.env,
}).loose();

export const PhotonEntryPartial = PhotonEntryUniversalHandler.extend({
  type: z.enum(["universal-handler", "server-config"]).optional(),
}).partial();

export const PhotonConfig = z.looseObject({
  server: z.union([z.string(), PhotonEntryServerPartial]).optional(),
  // This means that only a framework setting codeSplitting: false can also add entries without .id
  entries: z.record(z.string(), z.union([z.string(), PhotonEntryPartial])).optional(),
  hmr: z.union([z.boolean(), z.literal("prefer-restart")]).optional(),
  middlewares: z
    .array(
      z.custom<GetPhotonCondition>((fn) => {
        return typeof fn === "function";
      }),
    )
    .optional(),
  defaultBuildEnv: z.string().optional(),
  /**
   * Can be set to false by frameworks or deployment targets if code splitting is not supported
   */
  codeSplitting: z
    .object({
      framework: z.boolean().optional(),
      target: z.boolean().optional(),
    })
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
});

export const PhotonConfigResolved = z.looseObject({
  server: PhotonEntryServer,
  entries: z.array(z.union([PhotonEntryUniversalHandler, PhotonEntryServerConfig])),
  hmr: z.union([z.boolean(), z.literal("prefer-restart")]),
  middlewares: z.array(
    z.custom<GetPhotonCondition>((fn) => {
      return typeof fn === "function";
    }),
  ),
  defaultBuildEnv: z.string(),
  codeSplitting: z.object({
    framework: z.boolean(),
    target: z.boolean(),
  }),
  devServer: z.union([
    z.literal(false),
    z.object({
      env: z.string(),
      autoServe: z.boolean(),
    }),
  ]),
});
