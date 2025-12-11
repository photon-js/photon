import { enhance } from "@universal-middleware/core";

const standaloneMiddleware = enhance(
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

export default {
  fetch: standaloneMiddleware,
};
