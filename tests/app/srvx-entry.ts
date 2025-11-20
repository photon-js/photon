import { apply, serve } from "@photonjs/srvx";
import { hmrRoute } from "./hmr-route.js";

function startServer() {
  // Auto applies `awesomeFramework`
  const app = apply(
    // HMR route
    [hmrRoute],
  );

  return serve(app);
}

export default startServer();
