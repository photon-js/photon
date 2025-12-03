import indexHtml from "virtual:awesome-plugin:index-js";
import { enhance } from "@universal-middleware/core";

export const ssrMiddleware = enhance(
  async (_request: Request) => {
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
