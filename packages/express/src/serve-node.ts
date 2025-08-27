import { createServer } from "node:http";
import { installServerHMR, nodeServe, type ServerOptions } from "@photonjs/core/serve";
import type { App as ExpressApp } from "@universal-middleware/express";

export function serve<App extends ExpressApp>(app: App, options: ServerOptions = {}) {
  if (!options.createServer) options.createServer = createServer;
  // biome-ignore lint/suspicious/noExplicitAny: any
  const _serve = () => nodeServe(options, app as any);

  if (import.meta.hot) {
    installServerHMR(_serve);
  } else {
    _serve();
  }

  return app;
}
