import { bunServe } from "@photonjs/core/serve";
import type { App as HonoApp } from "@universal-middleware/hono";
import type { MergedHonoServerOptions } from "./types.js";

export function serve<App extends HonoApp>(app: App, options: MergedHonoServerOptions = {}) {
  bunServe(options, app.fetch);

  return app;
}
