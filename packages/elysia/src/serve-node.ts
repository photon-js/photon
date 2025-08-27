import { node } from "@elysiajs/node";
import { getPort, onReady, type ServerOptionsBase } from "@photonjs/core/serve";
import type { App as ElysiaApp } from "@universal-middleware/elysia";
import { Elysia } from "elysia";
import type { Serve } from "elysia/universal";
import { ensurePhotonServer } from "./symbol-utils.js";

export function serve<App extends ElysiaApp>(app: App, options: ServerOptionsBase = {}) {
  // TODO HMR
  const port = getPort(options);
  return ensurePhotonServer(
    // @ts-expect-error https://github.com/elysiajs/node/issues/46
    new Elysia({ adapter: node() })
      .mount(app)
      .listen(
        {
          port,
          hostname: options?.hostname,
        } as Partial<Serve>,
        onReady({ ...options, port }),
      ),
    app,
  );
}
