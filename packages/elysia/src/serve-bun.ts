import type { App as ElysiaApp } from "@universal-middleware/elysia";
import type { Serve } from "elysia/universal";
import { ensurePhotonServer } from "./symbol-utils.js";
import { getPort, onReady, type ServerOptionsBase } from "@photonjs/core/serve";

export function serve<App extends ElysiaApp>(app: App, options: ServerOptionsBase = {}) {
  const port = getPort(options);

  return ensurePhotonServer(
    app.listen(
      {
        port,
        hostname: options?.hostname,
      } as Partial<Serve>,
      onReady({ ...options, port }),
    ),
    app,
  );
}
