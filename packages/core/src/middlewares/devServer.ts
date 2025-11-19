import { enhance, type Get, type UniversalMiddleware } from "@universal-middleware/core";
import { handleViteDevServer } from "../runtime/adapters/handleViteDevServer.js";
import { globalStore } from "../runtime/globalStore.js";

export const devServerMiddleware = (() =>
  enhance(
    async (request, context, runtime) => {
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
