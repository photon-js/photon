import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:edge:hono";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hono";
import { createApply } from "@photonjs/core/apply";

export const apply = createApply("hono", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"hono">;
