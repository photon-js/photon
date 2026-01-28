import awesomeEntry from "virtual:ud:catch-all?default";
import { serve } from "@photonjs/hono";
import { apply } from "@universal-middleware/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Hono } from "hono";

function startServer() {
  const app = new Hono();

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

startServer();
