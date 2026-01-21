import awesomeEntry from "virtual:ud:catch-all?default";
import { apply, serve } from "@photonjs/srvx";
import awesomeMiddlewares from "awesome-framework/middlewares";

function startServer() {
  const app = apply([...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

export default startServer();
