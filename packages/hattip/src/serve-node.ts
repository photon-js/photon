import { createServer } from "node:http";
import { createMiddleware } from "@hattip/adapter-node";
import type { App as HattipApp } from "@universal-middleware/hattip";
import { buildHandler } from "./utils.js";
import { installServerHMR, type NodeHandler, nodeServe, type ServerOptions } from "@photonjs/core/serve";

export function serve<App extends HattipApp>(app: App, options: ServerOptions = {}) {
  if (!options.createServer) options.createServer = createServer;
  const handler = buildHandler(app);
  const listener = createMiddleware(handler);
  const _serve = () => nodeServe(options, listener as NodeHandler);

  if (import.meta.hot) {
    installServerHMR(_serve);
  } else {
    _serve();
  }

  return handler;
}
