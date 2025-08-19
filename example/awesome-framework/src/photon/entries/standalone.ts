import { enhance } from "@universal-middleware/core";

const standaloneMiddleware = enhance(
  async () => {
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

// This middleware will be used as a standalone handler, which means it is not included by `./universal-middleware` export
export default standaloneMiddleware;
