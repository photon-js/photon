import { enhance, MiddlewareOrder } from "@universal-middleware/core";

export const loggerMiddleware = enhance(
  (request: Request, ctx: Universal.Context) => {
    console.log("Request:", request.url, "Context:", ctx);
  },
  // enhance() adds meta data (a Universal Middleware in itself is just a Request => Response function)
  {
    name: "awesome-framework:log-request",
    order: MiddlewareOrder.LOGGING,
  },
);
