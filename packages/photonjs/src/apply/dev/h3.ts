import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:dev:h3";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/h3";
import { createApply } from "../common.js";
import { devServerMiddleware } from "@photonjs/core/dev";

export const apply = createApply("h3", applyAdapter, getUniversalEntries, getUniversalMiddlewares, devServerMiddleware);

export type RuntimeAdapter = RuntimeAdapterTarget<"h3">;
