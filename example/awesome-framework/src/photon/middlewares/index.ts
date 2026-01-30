import type { UniversalMiddleware } from "@universal-middleware/core";
import { loggerMiddleware } from "./logger";

export default [loggerMiddleware] as UniversalMiddleware[];
