// Will be moved to @photonjs/express
import { apply, serve } from "@photonjs/core/express";
import awesomeFramework from "awesome-framework/universal-middleware";
import express, { type Express } from "express";

function startServer(): Express {
  const app = express();

  apply(
    app,
    // Adds the framework's middlewares
    awesomeFramework,
  );

  return serve(app);
}

export default startServer();
