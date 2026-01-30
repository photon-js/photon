import photonEntry from "virtual:photon:entry";
import { createRouter } from "@hattip/router";
import { serve } from "@photonjs/hattip";
import { apply } from "@universal-middleware/hattip";
import awesomeMiddlewares from "awesome-framework/middlewares";

function startServer() {
  const app = createRouter();

  apply(app, [...awesomeMiddlewares, photonEntry.fetch]);

  return serve(app);
}

export default startServer() as unknown;
