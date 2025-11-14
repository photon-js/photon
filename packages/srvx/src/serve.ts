import type { ServeReturn, ServerOptions } from "@photonjs/core/serve";
import type { Handler } from "./types.js";

export function serve<App extends Handler>(app: App, options: ServerOptions = {}): ServeReturn<App> {
  return {
    fetch: typeof app === "function" ? app : app.fetch,
    server: {
      name: "srvx",
      app,
      options,
    },
  };
}
