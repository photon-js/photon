import type { ServeReturn } from "@photonjs/core/serve";
import { apply, serve } from "@photonjs/fastify";
import awesomeFramework from "awesome-framework/universal-middleware";
import fastify, { type FastifyInstance } from "fastify";

async function startServer(): Promise<ServeReturn<FastifyInstance>> {
  const app = fastify({
    // Ensures proper HMR support
    forceCloseConnections: true,
  });

  await apply(
    app,
    // Adds the framework's middlewares
    awesomeFramework,
  );

  return serve(app);
}

export default await startServer();
