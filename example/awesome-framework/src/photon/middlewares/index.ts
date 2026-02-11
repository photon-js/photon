import type { UniversalMiddleware } from "@universal-middleware/core";
import { loggerMiddleware } from "./logger.js";

export default [loggerMiddleware] as UniversalMiddleware[];
