import { pipeRoute } from "@universal-middleware/core";
import { apiMiddleware } from "./api.js";
import { loggerMiddleware } from "./logger.js";
import { ssrMiddleware } from "./ssr.js";

export default {
  fetch: pipeRoute([loggerMiddleware, apiMiddleware, ssrMiddleware]),
};
