import type { UniversalMiddleware } from "@universal-middleware/core";
import { apiMiddleware } from "../middlewares/api";
import { loggerMiddleware } from "../middlewares/logger";
import { ssrMiddleware } from "../middlewares/ssr";

export default [loggerMiddleware, apiMiddleware, ssrMiddleware] as UniversalMiddleware[];
