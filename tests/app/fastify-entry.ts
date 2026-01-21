import type { ServeReturn } from "@photonjs/core/serve";
import { apply, serve } from "@photonjs/fastify";
import awesomeMiddlewares from "awesome-framework/middlewares";
import awesomeEntry from "awesome-framework/server-entry";
import fastify, { type FastifyInstance } from "fastify";

async function startServer(): Promise<ServeReturn<FastifyInstance>> {
  const app = fastify({
    // Ensures proper HMR support
    forceCloseConnections: true,
  });

  await apply(app, [...awesomeMiddlewares, awesomeEntry.fetch]);

  app.get("/serverid", (_, reply) => {
    reply.send("fastify");
  });

  return serve(app);
}

export default await startServer();
