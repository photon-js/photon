import { getPort, installServerHMR, onReady, type ServerOptions } from "@photonjs/core/serve";
import { serve as srvxServe } from "srvx/node";
import type { Handler } from "./types.js";
import { defineFetchLazy } from "./utils.js";

export function serve<App extends Handler>(app: App, options: ServerOptions = {}) {
  const serverOptions = options.serverOptions ?? {};
  const isHttps = Boolean("cert" in serverOptions && serverOptions.cert);

  function _serve() {
    const port = getPort(options);
    const server = srvxServe({
      // biome-ignore lint/suspicious/noExplicitAny: any
      ...(options as any),
      port,
      hostname: options?.hostname,
      fetch: typeof app === "function" ? app : app.fetch,
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

  defineFetchLazy(app);

  return app;
}
