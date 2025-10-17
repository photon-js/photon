import { getUniversalEntries, getUniversalMiddlewares } from "virtual:photon:get-middlewares:node:fastify";
import { createAsyncApply } from "@photonjs/core/apply";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/fastify";

export const apply = createAsyncApply("fastify", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"fastify">;
