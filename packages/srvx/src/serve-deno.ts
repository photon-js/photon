import { denoServe, type ServerOptions } from "@photonjs/core/serve";
import type { ServerHandler } from "srvx";

export function serve<App extends ServerHandler>(app: App, options: ServerOptions = {}) {
  denoServe(options, app);

  return app;
}
