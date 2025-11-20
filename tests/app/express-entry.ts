import type { ServeReturn } from "@photonjs/core/serve";
import { apply, serve } from "@photonjs/express";
import express, { type Express } from "express";
import { hmrRoute } from "./hmr-route.js";

function startServer(): ServeReturn<Express> {
  const app = express();

  // Auto applies `awesomeFramework`
  apply(
    app,
    // HMR route
    [hmrRoute],
  );

  return serve(app);
}

export default startServer();
