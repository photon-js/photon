import type { App as HonoApp } from "@universal-middleware/hono";
import type { MergedHonoServerOptions } from "./hono-types.js";

export function serve<App extends HonoApp>(app: App, _options: MergedHonoServerOptions = {}) {
  return app;
}
