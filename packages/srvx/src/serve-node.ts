import { getPort, installServerHMR, onReady, type ServerOptions } from "@photonjs/core/serve";
import type { ServerHandler } from "srvx";
import { serve as srvxServe } from "srvx/node";

export function serve<App extends ServerHandler>(app: App, options: ServerOptions = {}) {
  const serverOptions = options.serverOptions ?? {};
  const isHttps = Boolean("cert" in serverOptions && serverOptions.cert);

  function _serve() {
    const port = getPort(options);
    const server = srvxServe({
      // biome-ignore lint/suspicious/noExplicitAny: any
      ...(options as any),
      port,
      hostname: options?.hostname,
      fetch: app,
    });
    // onCreate hook
    options.onCreate?.(server);

    server.ready().then(onReady({ isHttps, ...options, port }));

    // biome-ignore lint/style/noNonNullAssertion: used only in node context
    return server.node!.server!;
  }

  if (import.meta.hot) {
    installServerHMR(_serve);
  } else {
    _serve();
  }

  return app;
}
