import awesomeEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/hono";
import awesomeMiddlewares from "awesome-framework/middlewares";
import { Hono } from "hono";

function startServer(): ServerOptions {
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

  return {
    fetch: app.fetch,
    port: 3001,
  };
}

export default startServer();
