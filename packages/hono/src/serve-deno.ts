import type { App as HonoApp } from "@universal-middleware/hono";
import type { MergedHonoServerOptions } from "./types.js";
import { denoServe } from "@photonjs/core/serve";

export function serve<App extends HonoApp>(app: App, options: MergedHonoServerOptions = {}) {
  denoServe(options, app.fetch);

  return app;
}
