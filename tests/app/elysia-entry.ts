import awesomeEntry from "virtual:ud:catch-all?default";
import { apply, serve } from "@photonjs/elysia";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Elysia } from "elysia";

function startServer() {
  const app = new Elysia();

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  app.get("/serverid", () => {
    return new Response("elysia", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  });

  return serve(app);
}

export default startServer();
