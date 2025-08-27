import type { ServerOptions } from "@photonjs/core/serve";
import type { App as ExpressApp } from "@universal-middleware/express";

export function serve<App extends ExpressApp>(app: App, _options: ServerOptions = {}) {
  return app;
}
