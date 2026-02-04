import awesomeEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/fastify";
import awesomeMiddlewares from "awesome-framework/middlewares";
import fastify from "fastify";
import { toFetchHandler } from "srvx/node";

async function startServer(): Promise<ServerOptions> {
  const app = fastify({
    // Ensures proper HMR support
    forceCloseConnections: true,
  });

  app.get("/serverid", (_, reply) => {
    reply.send("fastify");
  });

  await apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);
  await app.ready();

  return {
    fetch: toFetchHandler(app.routing),
  };
}

export default await startServer();
