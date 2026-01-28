import type { ServeReturn, ServerOptionsBase } from "@photonjs/core";
import type { App as ElysiaApp } from "@universal-middleware/elysia";

export function serve<App extends ElysiaApp>(app: App, options: ServerOptionsBase = {}): ServeReturn<App> {
  return {
    fetch: app.fetch,
    server: {
      name: "elysia",
      app,
      options,
    },
  };
}
