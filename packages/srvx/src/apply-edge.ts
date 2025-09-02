import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:edge:srvx";
import { createApplyReturnApp } from "@photonjs/core/apply";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/srvx";

export const apply = createApplyReturnApp("srvx", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"srvx">;
