import { getUniversalEntries, getUniversalMiddlewares } from "photon:get-middlewares:dev:elysia";
import { devServerMiddleware } from "@photonjs/core/dev";
import type { RuntimeAdapterTarget, UniversalMiddleware } from "@universal-middleware/core";
import { type App, apply as applyAdapter } from "@universal-middleware/elysia";
import { createApply } from "@photonjs/core/apply";

export const apply: <T extends App>(app: T, additionalMiddlewares?: UniversalMiddleware[]) => T = createApply(
  "elysia",
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"elysia">;
