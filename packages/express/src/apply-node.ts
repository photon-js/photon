import { getUniversalEntries, getUniversalMiddlewares } from "virtual:photon:get-middlewares:node:express";
import { createApply } from "@photonjs/core/apply";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/express";

export const apply = createApply("express", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"express">;
