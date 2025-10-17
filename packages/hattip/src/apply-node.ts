import { getUniversalEntries, getUniversalMiddlewares } from "virtual:photon:get-middlewares:node:hattip";
import { createApply } from "@photonjs/core/apply";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hattip";

export const apply = createApply("hattip", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"hattip">;
