import type { App as HonoApp } from "@universal-middleware/hono";
import type { MergedHonoServerOptions } from "./types.js";
import { bunServe } from "@photonjs/core/serve";

export function serve<App extends HonoApp>(app: App, options: MergedHonoServerOptions = {}) {
  bunServe(options, app.fetch);

  return app;
}
