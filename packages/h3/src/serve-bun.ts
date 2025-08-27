import { bunServe, type ServerOptions } from "@photonjs/core/serve";
import type { App as H3App } from "@universal-middleware/h3";
import { toWebHandler } from "h3";

export function serve<App extends H3App>(app: App, options: ServerOptions = {}) {
  bunServe(options, toWebHandler(app));

  return app;
}
