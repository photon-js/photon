import { getUniversalEntries, getUniversalMiddlewares } from "virtual:photon:get-middlewares:edge:h3";
import { createApply } from "@photonjs/core/apply";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/h3";

export const apply = createApply("h3", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"h3">;
