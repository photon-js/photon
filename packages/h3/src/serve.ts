import type { NodeHandler, ServeReturn, ServerOptions } from "@photonjs/core";
import type { App as H3App } from "@universal-middleware/h3";
import { toNodeListener } from "h3";
import { defineFetchLazy } from "./utils.js";

export function serve<App extends H3App>(app: App, options: ServerOptions = {}): ServeReturn<App> {
  let nodeListener: NodeHandler | undefined;
  defineFetchLazy(app);

  return {
    get fetch() {
      return app.fetch;
    },
    server: {
      name: "h3",
      app,
      options,
      get nodeHandler() {
        if (!nodeListener) {
          nodeListener = toNodeListener(app) as NodeHandler;
        }
        return nodeListener;
      },
    },
  };
}
