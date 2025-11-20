import type { ServeReturn, ServerOptions } from "@photonjs/core/serve";
import type { App as HattipApp } from "@universal-middleware/hattip";
import { defineFetchLazy } from "./utils.js";

export function serve<App extends HattipApp>(app: App, options: ServerOptions = {}): ServeReturn<App> {
  defineFetchLazy(app);

  // We are not using @hattip/adapter-node, as srvx + crossws seems to do the job

  return {
    get fetch() {
      return app.fetch;
    },
    server: {
      name: "hattip",
      app,
      options,
    },
  };
}
