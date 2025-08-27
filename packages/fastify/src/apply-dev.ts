import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:dev:fastify";
import { createAsyncApply } from "@photonjs/core/apply";
import { devServerMiddleware } from "@photonjs/core/dev";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/fastify";

export const apply = createAsyncApply(
  "fastify",
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"fastify">;
