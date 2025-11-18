import type { IncomingMessage } from "node:http";
import { enhance, type Get, type UniversalMiddleware } from "@universal-middleware/core";
import { handleViteDevServer } from "../runtime/adapters/handleViteDevServer.js";
import { globalStore } from "../runtime/globalStore.js";

export const devServerMiddleware = (() =>
  enhance(
    async (request, context, runtime) => {
      const nodeReq: IncomingMessage | undefined =
        "req" in runtime && runtime.req
          ? runtime.req
          : // TODO When using srvx to serve(), and then use Hono, the `runtime` extracted by UM only comes from Hono,
            //      but it should be a merged runtime of both hono and srvx.
            // biome-ignore lint/suspicious/noExplicitAny: srvx request
            (request as any)?.runtime?.node?.req;

      if (nodeReq) {
        const needsUpgrade = globalStore.setupHMRProxy(nodeReq);

        if (needsUpgrade) {
          // Early response for HTTP connection upgrade
          return new Response(null);
        }
      }

      // Can be disabled, or can be running on a different environment
      if (!globalStore.viteDevServer) return;

      const { connectToWeb } = await import("@universal-middleware/express");
      const handled = await connectToWeb(handleViteDevServer)(request, context, runtime);

      if (handled) return handled;

      return (response) => {
        if (!response.headers.has("ETag")) {
          try {
            response.headers.set("Cache-Control", "no-store");
          } catch {
            // Headers already sent
          }
        }
        return response;
      };
    },
    {
      name: "photon:dev-server",
      immutable: false,
    },
  )) satisfies Get<[], UniversalMiddleware>;
