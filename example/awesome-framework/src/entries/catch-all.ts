import { pipeRoute } from "@universal-middleware/core";
import { apiMiddleware } from "./api.js";
import { loggerMiddleware } from "./logger.js";
import { ssrMiddleware } from "./ssr.js";

const defaultExport = /* @__PURE__ */ (() => ({
  fetch: pipeRoute([loggerMiddleware, apiMiddleware, ssrMiddleware]),
}))();

export default {
  fetch: defaultExport,
};
