import { denoServe, type ServerOptionsBase } from "@photonjs/core/serve";
import type { App as ElysiaApp } from "@universal-middleware/elysia";

export function serve<App extends ElysiaApp>(app: App, options: ServerOptionsBase = {}) {
  denoServe(options, app.fetch);

  return app;
}
