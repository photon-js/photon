import awesomeEntry from "virtual:photon:entry";
import type { ServeReturn } from "@photonjs/core";
import { serve } from "@photonjs/fastify";
import { apply } from "@universal-middleware/fastify";
import awesomeMiddlewares from "awesome-framework/middlewares";
import fastify, { type FastifyInstance } from "fastify";

async function startServer(): Promise<ServeReturn<FastifyInstance>> {
  const app = fastify({
    // Ensures proper HMR support
    forceCloseConnections: true,
  });

  app.get("/serverid", (_, reply) => {
    reply.send("fastify");
  });

  await apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  return serve(app);
}

export default await startServer();
