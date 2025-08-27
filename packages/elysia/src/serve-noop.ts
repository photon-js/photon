import type { App as ElysiaApp } from "@universal-middleware/elysia";
import type { ServerOptionsBase } from "@photonjs/core/serve";

export function serve<App extends ElysiaApp>(app: App, _options: ServerOptionsBase = {}) {
  return app;
}
