import { getUniversalEntries, getUniversalMiddlewares } from "virtual:photon:get-middlewares:dev:hattip";
import { createApply } from "@photonjs/core/apply";
import { devServerMiddleware } from "@photonjs/core/dev";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hattip";

export const apply = createApply(
  "hattip",
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"hattip">;
