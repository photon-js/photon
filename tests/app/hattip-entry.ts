import { createRouter } from "@hattip/router";
import { apply, serve } from "@photonjs/hattip";
import awesomeFramework from "awesome-framework/universal-middleware";

function startServer() {
  const app = createRouter();

  apply(
    app,
    // Adds the framework's middlewares
    awesomeFramework,
  );

  return serve(app);
}

export default startServer();
