import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:dev:srvx";
import { createApplyReturnApp } from "@photonjs/core/apply";
import { devServerMiddleware } from "@photonjs/core/dev";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/srvx";

export const apply = createApplyReturnApp(
  "srvx",
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"srvx">;
