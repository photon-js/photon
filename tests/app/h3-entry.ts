import awesomeEntry from "virtual:ud:catch-all?default";
import { apply, serve } from "@photonjs/h3";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { createApp } from "h3";

async function startServer() {
  const app = createApp();

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  app.use("/serverid", () => {
    return new Response("h3", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  });

  return serve(app);
}
