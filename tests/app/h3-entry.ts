import awesomeEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/h3";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { createApp, eventHandler, toWebHandler } from "h3";

function startServer(): ServerOptions {
  const app = createApp();

  app.use(
    "/serverid",
    eventHandler(() => {
      return new Response("h3", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }),
  );

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return {
    fetch: toWebHandler(app),
  };
}

export default startServer();
