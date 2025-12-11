import { enhance, pipe } from "@universal-middleware/core";
import { loggerMiddleware } from "./logger.js";

export const apiMiddleware = enhance(
  () => {
    return new Response("The API Route", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
  // enhance() adds meta data (a Universal Middleware in itself is just a Request => Response function)
  {
    name: "awesome-framework:api",
    path: "/api",
    method: "GET",
  },
);

export default {
  fetch: pipe(loggerMiddleware, apiMiddleware),
};
