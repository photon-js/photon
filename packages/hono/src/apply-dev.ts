import { createApply } from "@photonjs/core/apply";
import { devServerMiddleware } from "@photonjs/core/dev";
import type { RuntimeAdapterTarget } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hono";

export const apply = createApply(
  "hono",
  applyAdapter,
  () => [],
  () => [],
  devServerMiddleware,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"hono">;
