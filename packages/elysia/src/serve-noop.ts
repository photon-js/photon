import type { ServerOptionsBase } from "@photonjs/core/serve";
import type { App as ElysiaApp } from "@universal-middleware/elysia";

export function serve<App extends ElysiaApp>(app: App, _options: ServerOptionsBase = {}) {
  return app;
}
