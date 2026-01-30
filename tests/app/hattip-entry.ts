import awesomeEntry from "virtual:photon:entry";
import { createRouter, type Router } from "@hattip/router";
import type { ServeReturn } from "@photonjs/core";
import { serve } from "@photonjs/hattip";
import { apply } from "@universal-middleware/hattip";
import awesomeMiddlewares from "awesome-framework/middlewares";

function startServer(): ServeReturn<Router> {
  const app = createRouter();

  app.get("/serverid", () => {
    return new Response("hattip", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  });

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

export default startServer();
