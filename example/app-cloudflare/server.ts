import photonEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Hono } from "hono";

function startApp(): ServerOptions {
  const app = new Hono();

  apply(app, [...awesomeMiddlewares, photonEntry.fetch]);

  return {
    fetch: app.fetch,
  };
}

export default startApp();
