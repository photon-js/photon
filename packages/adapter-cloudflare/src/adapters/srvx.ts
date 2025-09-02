import type { ExportedHandlerFetchHandler } from "@cloudflare/workers-types";
import type { SrvxHandler } from "@universal-middleware/srvx";

export function asFetch<App extends SrvxHandler<Universal.Context>>(app: App): ExportedHandlerFetchHandler {
  return app as unknown as ExportedHandlerFetchHandler;
}
