import { denoServe, type ServerOptions } from "@photonjs/core/serve";
import type { Handler } from "./types.js";

export function serve<App extends Handler>(app: App, options: ServerOptions = {}) {
  denoServe(options, app);

  return app;
}
