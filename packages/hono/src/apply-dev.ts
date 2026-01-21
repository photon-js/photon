import { getUniversalEntries, getUniversalMiddlewares } from "virtual:photon:get-middlewares:dev:hono";
import type { Fetchable } from "@photonjs/core/api/internal";
import { createApply } from "@photonjs/core/apply";
import { devServerMiddleware } from "@photonjs/core/dev";
import type { RuntimeAdapterTarget, UniversalMiddleware } from "@universal-middleware/core";
import { apply as applyAdapter } from "@universal-middleware/hono";

export const apply = createApply(
  "hono",
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
);

function fetchableToUniversalMiddleware(entry: Fetchable): UniversalMiddleware {
  return entry.fetch;
}

export type RuntimeAdapter = RuntimeAdapterTarget<"hono">;
