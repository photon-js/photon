import type { ServeReturn } from "@photonjs/core/serve";
import type { App as HonoApp } from "@universal-middleware/hono";
import type { MergedHonoServerOptions } from "./types.js";

export function serve<App extends HonoApp>(app: App, options: MergedHonoServerOptions = {}): ServeReturn<App> {
  if (options.overrideGlobalObjects) {
    console.warn(`'overrideGlobalObjects' option is ignored when targetting non-node environment`);
  }
  if (options.autoCleanupIncoming) {
    console.warn(`'autoCleanupIncoming' option is ignored when targetting non-node environment`);
  }
  if (options.hostname) {
    console.warn(`'hostname' option is ignored when targetting non-node environment`);
  }

  return {
    fetch: app.fetch,
    server: {
      name: "hono",
      app,
      options,
    },
  };
}
