import { bunServe, type ServerOptions } from "@photonjs/core/serve";
import type { ServerHandler } from "srvx";

export function serve<App extends ServerHandler>(app: App, options: ServerOptions = {}) {
  bunServe(options, app);

  return app;
}
