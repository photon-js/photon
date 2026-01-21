import awesomeEntry from "virtual:ud:catch-all?default";
import { serve } from "@photonjs/hono";
import { apply } from "@universal-middleware/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Hono } from "hono";

function startServer() {
  const app = new Hono();

  app.get("/serverid", () => {
    return new Response("hono", {
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
