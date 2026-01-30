import photonEntry from "virtual:photon:entry";
import { serve } from "@photonjs/hono";
import { apply } from "@universal-middleware/hono";
import { Hono } from "hono";

console.log(photonEntry);
// FIXME this file is imported twice in the bundle
function startServer() {
  const app = new Hono();

  apply(app, [photonEntry.fetch]);

  return serve(app);
}

export default startServer() as unknown;
