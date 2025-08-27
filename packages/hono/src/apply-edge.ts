import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:edge:hono";
import { createApply } from "@photonjs/core/apply";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hono";

export const apply = createApply("hono", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"hono">;
