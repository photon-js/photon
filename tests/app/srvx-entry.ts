import awesomeEntry from "virtual:photon:entry";
import type { ServerOptions } from "@photonjs/runtime";
import { enhance } from "@universal-middleware/core";
import { apply } from "@universal-middleware/srvx";
import awesomeMiddlewares from "awesome-framework/middlewares";

function startServer(): ServerOptions {
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

  return {
    fetch: app,
  };
}

export default startServer();
