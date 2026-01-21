import type { IncomingMessage, ServerResponse } from "node:http";
import type { NodeHandler, ServeReturn } from "@photonjs/core/serve";
import type { App as HonoApp } from "@universal-middleware/hono";
import type { MergedHonoServerOptions } from "./types.js";

export function serve<App extends HonoApp>(app: App, options: MergedHonoServerOptions = {}): ServeReturn<App> {
  const exposeNodeHandler = Boolean(options.overrideGlobalObjects || options.autoCleanupIncoming || options.hostname);

  let nodeHandler: undefined | NodeHandler;

  if (exposeNodeHandler) {
    const honoHandler: NodeHandler = async (incoming, outgoing) => {
      // quick access to `nodeHandler` if already overriden
      if (nodeHandler && honoHandler !== nodeHandler)
        return nodeHandler(incoming as IncomingMessage, outgoing as ServerResponse);
      try {
        const { getRequestListener } = await import("@hono/node-server");
        const listener = getRequestListener(app.fetch, options);
        // cache nodeHandler
        nodeHandler = listener;
        return listener(incoming, outgoing);
      } catch (e) {
        throw new Error(`Missing @hono/node-server package. Add it to your dependencies`, { cause: e });
      }
    };
    nodeHandler = honoHandler;
  }

  return {
    fetch: app.fetch,
    server: {
      name: "hono",
      app,
      options,
      get nodeHandler() {
        return nodeHandler;
      },
    },
  };
}
