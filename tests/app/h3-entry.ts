import { apply, serve } from "@photonjs/h3";
import { createApp } from "h3";
import { hmrRoute } from "./hmr-route.js";

async function startServer() {
  const app = createApp();

  // Auto applies `awesomeFramework`
  apply(
    app,
    // HMR route
    [hmrRoute],
  );

  return serve(app);
}

export default await startServer();
