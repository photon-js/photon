import type { ServerOptionsBase } from "@photonjs/core/serve";
import type { App as FastifyApp } from "@universal-middleware/fastify";

export function serve<App extends FastifyApp>(app: App, _options: ServerOptionsBase = {}) {
  return app;
}
