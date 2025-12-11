import { pipeRoute, type UniversalHandler } from "@universal-middleware/core";
import { createHandler } from "@universal-middleware/srvx";
import { apiMiddleware } from "./api.js";
import { loggerMiddleware } from "./logger.js";
import { ssrMiddleware } from "./ssr.js";

const defaultExport = /* @__PURE__ */ (() => ({
  fetch: createHandler(() => pipeRoute([loggerMiddleware, apiMiddleware, ssrMiddleware]) as UniversalHandler)(),
}))();

export default defaultExport;
