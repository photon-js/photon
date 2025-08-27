import { apply, serve } from "@photonjs/hono";
import awesomeFramework from "awesome-framework/universal-middleware";
import { Hono } from "hono";

function startServer() {
  const app = new Hono();

  apply(
    app,
    // Adds the framework's middlewares
    awesomeFramework,
  );

  return serve(app);
}

startServer();
