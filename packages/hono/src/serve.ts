import type { IncomingMessage, ServerResponse } from "node:http";
import type { Http2ServerRequest, Http2ServerResponse } from "node:http2";
import { PhotonDependencyError } from "@photonjs/core/errors";
import type { ServeReturn } from "@photonjs/core/serve";
import type { App as HonoApp } from "@universal-middleware/hono";
import type { MergedHonoServerOptions } from "./types.js";

export function serve<App extends HonoApp>(app: App, options: MergedHonoServerOptions = {}): ServeReturn<App> {
  const exposeNodeHandler = Boolean(options.overrideGlobalObjects || options.autoCleanupIncoming || options.hostname);

  let nodeHandler:
    | undefined
    | ((
        incoming: IncomingMessage | Http2ServerRequest,
        outgoing: ServerResponse | Http2ServerResponse,
      ) => void | Promise<void>);

  if (exposeNodeHandler) {
    nodeHandler = async (incoming, outgoing) => {
      try {
        // FIXME when built on userland, this should be included into bundle only if it is installed (falling back to dummy module?)
        const { getRequestListener } = await import("@hono/node-server");
        const listener = getRequestListener(app.fetch, options);
        // cache nodeHandler
        nodeHandler = listener;
        return listener(incoming, outgoing);
      } catch (e) {
        throw new PhotonDependencyError(`Missing @hono/node-server package. Add it to your dependencies`, { cause: e });
      }
    };
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
