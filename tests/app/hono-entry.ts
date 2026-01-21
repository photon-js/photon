import { apply, serve } from "@photonjs/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import awesomeEntry from "awesome-framework/server-entry";
import { Hono } from "hono";

function startServer() {
  const app = new Hono();

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

export default startServer();
