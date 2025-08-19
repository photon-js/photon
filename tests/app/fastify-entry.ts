// Will be moved to @photonjs/fastify
import { apply, serve } from "@photonjs/core/fastify";
import awesomeFramework from "awesome-framework/universal-middleware";
import fastify, { type FastifyInstance } from "fastify";

async function startServer(): Promise<FastifyInstance> {
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
