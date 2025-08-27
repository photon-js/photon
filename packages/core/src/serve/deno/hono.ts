import type { App as HonoApp } from "@universal-middleware/hono";
import type { MergedHonoServerOptions } from "../noop/hono-types.js";
import { denoServe } from "../utils.js";

export function serve<App extends HonoApp>(app: App, options: MergedHonoServerOptions = {}) {
  denoServe(options, app.fetch);

  return app;
}
