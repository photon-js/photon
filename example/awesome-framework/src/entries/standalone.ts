import { enhance } from "@universal-middleware/core";
import { createHandler } from "@universal-middleware/srvx";

export const standaloneMiddleware = enhance(
  () => {
    return new Response("The /standalone Route", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
  // enhance() adds meta data (a Universal Middleware in itself is just a Request => Response function)
  {
    name: "awesome-framework:standalone",
    path: "/standalone",
    method: "GET",
  },
);

const defaultExport = /* @__PURE__ */ (() => ({
  fetch: createHandler(() => standaloneMiddleware)(),
}))();

export default defaultExport;
