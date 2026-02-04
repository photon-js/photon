import awesomeEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Hono } from "hono";

function startServer(): ServerOptions {
  const app = new Hono();

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return {
    fetch: app.fetch,
  };
}

startServer();
