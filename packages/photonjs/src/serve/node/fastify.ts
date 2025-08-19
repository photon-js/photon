import pc from "@brillout/picocolors";
import type { App as FastifyApp } from "@universal-middleware/fastify";
import type { FastifyListenOptions } from "fastify";
import { getPort, installServerHMR, onReady, type ServerOptionsBase } from "../utils.js";

export function serve<App extends FastifyApp>(app: App, options: ServerOptionsBase = {}) {
  const _serve = () => {
    const port = getPort(options);
    app.listen(
      {
        port,
        host: options?.hostname,
      } as FastifyListenOptions,
      onReady({ ...options, port }),
    );
    const server = app.server;
    // onCreate hook
    options.onCreate?.(server);
    return server;
  };

  if (import.meta.hot) {
    const optionsSymbol = Object.getOwnPropertySymbols(app).find((s) => s.toString() === "Symbol(fastify.options)");
    // biome-ignore lint/suspicious/noExplicitAny: any
    const appAny = app as Record<symbol, any>;

    if (optionsSymbol && !appAny[optionsSymbol]?.forceCloseConnections) {
      console.warn(
        pc.yellow(
          `${pc.bold("[photon:fastify]")} Please make sure that fastify is initialized with \`{ forceCloseConnections: true }\` for proper HMR support.`,
        ),
      );
    }

    installServerHMR(_serve);
  } else {
    _serve();
  }

  return app;
}
