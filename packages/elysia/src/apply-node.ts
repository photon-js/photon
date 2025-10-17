import { getUniversalEntries, getUniversalMiddlewares } from "virtual:photon:get-middlewares:node:elysia";
import { createApply } from "@photonjs/core/apply";
import type { RuntimeAdapterTarget, UniversalMiddleware } from "@universal-middleware/core";
import { type App, apply as applyAdapter } from "@universal-middleware/elysia";

export const apply: <T extends App>(app: T, additionalMiddlewares?: UniversalMiddleware[]) => T = createApply(
  "elysia",
  applyAdapter,
  getUniversalEntries,
  getUniversalMiddlewares,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"elysia">;
