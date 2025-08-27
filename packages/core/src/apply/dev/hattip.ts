import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:dev:hattip";
import { devServerMiddleware } from "@photonjs/core/dev";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hattip";
import { createApply } from "../common.js";

export const apply = createApply(
  "hattip",
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"hattip">;
