import awesomeEntry from "virtual:photon:entry";
import type { ServeReturn } from "@photonjs/core";
import { serve } from "@photonjs/srvx";
import { enhance } from "@universal-middleware/core";
import { apply, type SrvxHandler } from "@universal-middleware/srvx";
import awesomeMiddlewares from "awesome-framework/middlewares";

function startServer(): ServeReturn<SrvxHandler<Universal.Context>> {
  const app = apply([
    ...awesomeMiddlewares,
    enhance(
      () => {
        return new Response("srvx", {
          status: 200,
          headers: {
            "Content-Type": "text/plain",
          },
        });
      },
      {
        path: "/serverid",
        method: "GET",
      },
    ),
    awesomeEntry.fetch,
  ]);

  return serve(app);
}

export default startServer();
