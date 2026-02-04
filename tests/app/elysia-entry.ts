import awesomeEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/elysia";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Elysia } from "elysia";

function startServer(): ServerOptions {
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

  return {
    fetch: app.fetch,
  };
}

export default startServer();
