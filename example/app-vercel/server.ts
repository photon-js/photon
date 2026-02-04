import photonEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/express";
import awesomeMiddlewares from "awesome-framework/middlewares";
import express from "express";
import { toFetchHandler } from "srvx/node";

function startServer(): ServerOptions {
  const app = express();

  apply(app, [...awesomeMiddlewares, photonEntry.fetch]);

  return {
    fetch: toFetchHandler(app),
  };
}

export default startServer();
