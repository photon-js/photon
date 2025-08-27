import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:edge:h3";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/h3";
import { createApply } from "../common.js";

export const apply = createApply("h3", applyAdapter, getUniversalEntries, getUniversalMiddlewares);

export type RuntimeAdapter = RuntimeAdapterTarget<"h3">;
