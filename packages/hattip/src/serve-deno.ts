import type { App as HattipApp } from "@universal-middleware/hattip";
import { buildHandler } from "./utils.js";
import { denoServe, type ServerOptions } from "@photonjs/core/serve";

export function serve<App extends HattipApp>(app: App, options: ServerOptions = {}) {
  const handler = buildHandler(app);
  denoServe(options, (request) => {
    return handler({
      request,
      ip: "",
      passThrough() {
        // No op
      },
      waitUntil() {
        // No op
      },
      platform: { name: "deno" },
      env(variable: string) {
        return process.env[variable];
      },
    });
  });

  return handler;
}
