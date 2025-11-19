import { apply, serve } from "@photonjs/elysia";
import { Elysia } from "elysia";
import { hmrRoute } from "./hmr-route.js";

function startServer() {
  const app = new Elysia();

  // Auto applies `awesomeFramework`
  apply(
    app,
    // HMR route
    [hmrRoute],
  );

  return serve(app);
}

export default startServer();
