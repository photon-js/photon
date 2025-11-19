import { apply, serve } from "@photonjs/hono";
import { Hono } from "hono";
import { hmrRoute } from "./hmr-route.js";

function startServer() {
  const app = new Hono();

  // Auto applies `awesomeFramework`
  apply(
    app,
    // HMR route
    [hmrRoute],
  );

  return serve(app);
}

export default startServer();
