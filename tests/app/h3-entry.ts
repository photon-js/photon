import awesomeEntry from "virtual:ud:catch-all?default";
import { serve } from "@photonjs/h3";
import { apply } from "@universal-middleware/h3";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { createApp } from "h3";

function startServer() {
  const app = createApp();

  app.use("/serverid", () => {
    return new Response("h3", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  });

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

export default startServer();
