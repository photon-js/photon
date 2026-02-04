import photonEntry from "virtual:photon:entry";
import type { HattipHandler } from "@hattip/core";
import { createRouter } from "@hattip/router";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/hattip";
import awesomeMiddlewares from "awesome-framework/middlewares";

function createFetchHandler(handler: HattipHandler) {
  return (request: Request) => {
    return handler({
      request,
      ip: "",
      env(variable) {
        return process.env[variable];
      },
      waitUntil() {
        // No op
      },
      passThrough() {
        // No op
      },
      platform: { name: "fetch" },
    });
  };
}

function startServer(): ServerOptions {
  const app = createRouter();

  apply(app, [...awesomeMiddlewares, photonEntry.fetch]);

  return {
    fetch: createFetchHandler(app.buildHandler()),
  };
}

export default startServer();
