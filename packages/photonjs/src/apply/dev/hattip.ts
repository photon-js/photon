import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:dev:hattip";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hattip";
import { createApply } from "../common.js";
import { devServerMiddleware } from "@photonjs/core/dev";

export const apply = createApply(
  "hattip",
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"hattip">;
