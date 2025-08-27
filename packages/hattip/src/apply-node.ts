import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:node:hattip";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hattip";
import { createApply } from "@photonjs/core/apply";

export const apply = createApply("hattip", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"hattip">;
