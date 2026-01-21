import { apply, serve } from "@photonjs/srvx";
import awesomeMiddlewares from "awesome-framework/middlewares";
import awesomeEntry from "awesome-framework/server-entry";

function startServer() {
  const app = apply([...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

export default startServer();
