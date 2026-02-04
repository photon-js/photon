import photonEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { apply } from "@universal-middleware/hono";
import { Hono } from "hono";

function startServer(): ServerOptions {
  const app = new Hono();

  apply(app, [photonEntry.fetch]);

  return {
    fetch: app.fetch,
  };
}

export default startServer() as unknown;
