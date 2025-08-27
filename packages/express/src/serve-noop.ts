import type { App as ExpressApp } from "@universal-middleware/express";
import type { ServerOptions } from "@photonjs/core/serve";

export function serve<App extends ExpressApp>(app: App, _options: ServerOptions = {}) {
  return app;
}
