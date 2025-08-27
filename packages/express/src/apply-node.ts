import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:node:express";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/express";
import { createApply } from "@photonjs/core/apply";

export const apply = createApply("express", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"express">;
