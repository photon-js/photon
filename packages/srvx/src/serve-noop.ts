import type { ServerOptions } from "@photonjs/core/serve";
import type { Handler } from "./types.js";

export function serve<App extends Handler>(app: App, _options: ServerOptions = {}) {
  return app;
}
