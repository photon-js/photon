import { apply, serve } from "@photonjs/elysia";
import awesomeFramework from "awesome-framework/universal-middleware";
import { Elysia } from "elysia";

function startServer() {
  const app = new Elysia();

  apply(
    app,
    // Adds the framework's middlewares
    awesomeFramework,
  );

  return serve(app);
}

export default startServer();
