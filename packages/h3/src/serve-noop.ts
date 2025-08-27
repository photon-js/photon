import type { ServerOptions } from "@photonjs/core/serve";
import type { App as H3App } from "@universal-middleware/h3";

export function serve<App extends H3App>(app: App, _options: ServerOptions = {}) {
  return app;
}
