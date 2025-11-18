import type { IncomingMessage, ServerResponse } from "node:http";
import type { NodeHandler, ServeReturn, ServerOptionsBase } from "@photonjs/core/serve";
import type { App as FastifyApp } from "@universal-middleware/fastify";
import { bold, yellow } from "ansis";

export function serve<App extends FastifyApp>(app: App, options: ServerOptionsBase = {}): ServeReturn<App> {
  if (import.meta.hot) {
    const optionsSymbol = Object.getOwnPropertySymbols(app).find((s) => s.toString() === "Symbol(fastify.options)");
    // biome-ignore lint/suspicious/noExplicitAny: any
    const appAny = app as Record<symbol, any>;

    if (optionsSymbol && !appAny[optionsSymbol]?.forceCloseConnections) {
      console.warn(
        yellow(
          `${bold("[photon:fastify]")} Please make sure that fastify is initialized with \`{ forceCloseConnections: true }\` for proper HMR support.`,
        ),
      );
    }
  }

  let nodeHandler: NodeHandler = (req, res) => {
    app.ready().then(() => {
      // cache handler once ready
      nodeHandler = app.routing as NodeHandler;
      app.routing(req as IncomingMessage, res as ServerResponse);
    });
  };

  return {
    // @ts-expect-error throw
    get fetch() {
      throw new Error(
        "Fastify does not support the `fetch` interface. Prefer servers like Hono that support edge runtimes",
      );
    },
    server: {
      name: "fastify",
      app,
      options,
      get nodeHandler() {
        return nodeHandler;
      },
    },
  };
}
