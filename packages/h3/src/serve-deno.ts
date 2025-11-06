import { denoServe, type ServerOptions } from "@photonjs/core/serve";
import type { App as H3App } from "@universal-middleware/h3";
import { defineFetchLazy } from "./utils.js";

export function serve<App extends H3App>(app: App, options: ServerOptions = {}) {
  defineFetchLazy(app);
  denoServe(options, app.fetch);

  return app;
}
