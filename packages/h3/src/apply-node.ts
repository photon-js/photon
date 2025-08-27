import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:node:h3";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/h3";
import { createApply } from "@photonjs/core/apply";

export const apply = createApply("h3", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"h3">;
