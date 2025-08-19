import { enhance } from "@universal-middleware/core";

export const apiMiddleware = enhance(
  async () => {
    return new Response("The API Route", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
  // enhance() adds meta data (a Universal Middleware in itself is just a Request => Response function)
  {
    name: "awesome-framework:api-route",
    path: "/api",
    method: "GET",
  },
);
