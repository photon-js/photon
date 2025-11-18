import type { ServeReturn } from "@photonjs/core/serve";
import { apply, serve } from "@photonjs/express";
import awesomeFramework from "awesome-framework/universal-middleware";
import express, { type Express } from "express";

function startServer(): ServeReturn<Express> {
  const app = express();

  apply(
    app,
    // Adds the framework's middlewares
    awesomeFramework,
  );

  return serve(app);
}

export default startServer();
