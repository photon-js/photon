import type { ServeReturn, ServerOptions } from "@photonjs/core";
import type { App as ExpressApp } from "@universal-middleware/express";
import { toFetchHandler } from "srvx/node";

export function serve<App extends ExpressApp>(app: App, options: ServerOptions = {}): ServeReturn<App> {
  return {
    fetch: toFetchHandler(app),
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
