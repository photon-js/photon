import { getUniversalEntries, getUniversalMiddlewares } from "virtual:photon:get-middlewares:dev:elysia";
import { createApply } from "@photonjs/core/apply";
import { devServerMiddleware } from "@photonjs/core/dev";
import type { RuntimeAdapterTarget, UniversalMiddleware } from "@universal-middleware/core";
import { type App, apply as applyAdapter } from "@universal-middleware/elysia";

export const apply: <T extends App>(app: T, additionalMiddlewares?: UniversalMiddleware[]) => T = createApply(
  "elysia",
  // biome-ignore lint/suspicious/noExplicitAny: ignore cast error
  applyAdapter as any,
  getUniversalEntries,
  getUniversalMiddlewares,
  devServerMiddleware,
);

export type RuntimeAdapter = RuntimeAdapterTarget<"elysia">;
