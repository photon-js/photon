import awesomeEntry from "virtual:photon:entry";
import type { ServeReturn } from "@photonjs/core";
import { serve } from "@photonjs/h3";
import { apply } from "@universal-middleware/h3";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { type App, createApp, eventHandler } from "h3";

function startServer(): ServeReturn<App> {
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

  return serve(app);
}

export default startServer();
