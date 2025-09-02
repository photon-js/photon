import { apply, serve } from "@photonjs/srvx";
import awesomeFramework from "awesome-framework/universal-middleware";

function startServer() {
  const app = apply(
    // Adds the framework's middlewares
    awesomeFramework,
  );

  return serve(app);
}

export default startServer();
