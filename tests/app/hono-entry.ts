import awesomeEntry from "virtual:photon:entry";
import type { ServeReturn } from "@photonjs/core";
import { serve } from "@photonjs/hono";
import { type App, apply } from "@universal-middleware/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Hono } from "hono";

function startServer(): ServeReturn<App> {
  const app = new Hono();

  app.get("/serverid", () => {
    return new Response("hono", {
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
