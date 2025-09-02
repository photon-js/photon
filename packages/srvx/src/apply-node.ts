import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:node:srvx";
import { createApply } from "@photonjs/core/apply";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/srvx";

export const apply = createApply("srvx", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"srvx">;
