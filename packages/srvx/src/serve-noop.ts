import type { ServerOptions } from "@photonjs/core/serve";

export function serve<App extends ServerOptions>(app: App, _options: ServerOptions = {}) {
  return app;
}
