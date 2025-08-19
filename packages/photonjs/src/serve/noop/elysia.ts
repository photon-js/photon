import type { App as ElysiaApp } from "@universal-middleware/elysia";
import type { ServerOptionsBase } from "../utils.js";

export function serve<App extends ElysiaApp>(app: App, _options: ServerOptionsBase = {}) {
  return app;
}
