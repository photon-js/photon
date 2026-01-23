import type { ServeReturn, ServerOptions } from "@photonjs/core";
import type { App as ExpressApp } from "@universal-middleware/express";

export function serve<App extends ExpressApp>(app: App, options: ServerOptions = {}): ServeReturn<App> {
  return {
    // @ts-expect-error throw
    get fetch() {
      throw new Error(
        "Express does not support the `fetch` interface. Prefer servers like Hono that support edge runtimes",
      );
    },
    server: {
      name: "express",
      app,
      options,
      get nodeHandler() {
        return app;
      },
    },
  };
}
