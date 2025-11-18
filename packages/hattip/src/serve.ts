import type { ServeReturn, ServerOptions } from "@photonjs/core/serve";
import type { App as HattipApp } from "@universal-middleware/hattip";
import { defineFetchLazy } from "./utils.js";

export function serve<App extends HattipApp>(app: App, options: ServerOptions = {}): ServeReturn<App> {
  defineFetchLazy(app);

  return {
    fetch: app.fetch,
    server: {
      name: "hattip",
      app,
      options,
    },
  };
}
