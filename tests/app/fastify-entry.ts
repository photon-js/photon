import type { ServeReturn } from "@photonjs/core/serve";
import { apply, serve } from "@photonjs/fastify";
import fastify, { type FastifyInstance } from "fastify";
import { hmrRoute } from "./hmr-route.js";

async function startServer(): Promise<ServeReturn<FastifyInstance>> {
  const app = fastify({
    // Ensures proper HMR support
    forceCloseConnections: true,
  });

  // Auto applies `awesomeFramework`
  await apply(
    app,
    // HMR route
    [hmrRoute],
  );

  return serve(app);
}

export default await startServer();
