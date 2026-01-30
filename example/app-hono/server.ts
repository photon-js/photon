import photonEntry from "virtual:photon:entry";
import { serve } from "@photonjs/hono";
import { apply } from "@universal-middleware/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Hono } from "hono";

function startServer() {
  const app = new Hono();

  apply(app, [...awesomeMiddlewares, photonEntry.fetch]);

  return serve(app);
}

export default startServer() as unknown;
