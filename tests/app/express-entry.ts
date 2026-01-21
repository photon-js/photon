import awesomeEntry from "virtual:ud:catch-all?default";
import type { ServeReturn } from "@photonjs/core/serve";
import { apply, serve } from "@photonjs/express";
import awesomeMiddlewares from "awesome-framework/middlewares";
import express, { type Express } from "express";

function startServer(): ServeReturn<Express> {
  const app = express();

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  app.get("/serverid", (_, res) => {
    res.status(200).send("express");
  });

  return serve(app);
}

export default startServer();
