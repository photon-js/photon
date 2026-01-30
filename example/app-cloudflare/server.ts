import photonEntry from "virtual:photon:entry";
import { serve } from "@photonjs/hono";
import { apply } from "@universal-middleware/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Hono } from "hono";

console.log({
  awesomeMiddlewares,
  photonEntry,
  fetch: photonEntry.fetch,
});

function startApp() {
  const app = new Hono();

  apply(app, [...awesomeMiddlewares, photonEntry.fetch]);

  return serve(app);
}

export default startApp() as unknown;
