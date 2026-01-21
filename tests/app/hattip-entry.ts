import awesomeEntry from "virtual:ud:catch-all?default";
import { createRouter } from "@hattip/router";
import { apply, serve } from "@photonjs/hattip";
import awesomeMiddlewares from "awesome-framework/middlewares";

function startServer() {
  const app = createRouter();

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  app.get("/serverid", () => {
    return new Response("hattip", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  });

  return serve(app);
}

export default startServer();
