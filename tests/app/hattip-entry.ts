import { createRouter } from "@hattip/router";
import { apply, serve } from "@photonjs/hattip";
import { hmrRoute } from "./hmr-route.js";

function startServer() {
  const app = createRouter();

  // Auto applies `awesomeFramework`
  apply(
    app,
    // HMR route
    [hmrRoute],
  );

  return serve(app);
}

export default startServer();
