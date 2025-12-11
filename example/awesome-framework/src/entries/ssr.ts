import indexHtml from "virtual:awesome-plugin:index-js";
import { enhance, pipe } from "@universal-middleware/core";
import { loggerMiddleware } from "./logger.js";

export const ssrMiddleware = enhance(
  (_request: Request) => {
    return new Response(indexHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
  // enhance() adds meta data (a Universal Middleware in itself is just a Request => Response function)
  {
    name: "awesome-framework:ssr",
    path: "/**",
    method: "GET",
  },
);

const defaultExport = /* @__PURE__ */ (() => ({
  fetch: pipe(loggerMiddleware, ssrMiddleware),
}))();

export default {
  fetch: defaultExport,
};
