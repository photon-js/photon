import photonEntry from "virtual:photon:entry";
import { serve } from "@photonjs/express";
import { apply } from "@universal-middleware/express";
import awesomeMiddlewares from "awesome-framework/middlewares";
import express from "express";

function startServer() {
  const app = express();

  apply(app, [...awesomeMiddlewares, photonEntry.fetch]);

  return serve(app);
}

export default startServer() as unknown;
