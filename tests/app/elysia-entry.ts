import awesomeEntry from "virtual:photon:entry";
import { serve } from "@photonjs/elysia";
import { apply } from "@universal-middleware/elysia";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Elysia } from "elysia";

function startServer() {
  const app = new Elysia();

  app.get("/serverid", () => {
    return new Response("elysia", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  });

  apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

export default startServer() as unknown;
