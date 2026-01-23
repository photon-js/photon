import awesomeEntry from "virtual:ud:catch-all?default";
import type { ServeReturn } from "@photonjs/core";
import { serve } from "@photonjs/express";
import { apply } from "@universal-middleware/express";
import awesomeMiddlewares from "awesome-framework/middlewares";
import express, { type Express } from "express";

function startServer(): ServeReturn<Express> {
  const app = express();

  app.get("/serverid", (_, res) => {
    res.status(200).send("express");
  });

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

export default startServer();
