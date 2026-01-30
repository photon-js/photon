import type { App as H3App } from "@universal-middleware/h3";
import { toWebHandler } from "h3";

export function defineFetchLazy<App extends H3App>(app: App): asserts app is App & Fetchable {
  return defineFetchLazyCore<App>(app, toWebHandler);
}

type FetchHandler = (request: Request) => Response | Promise<Response>;
type Fetchable = { fetch: FetchHandler };

function defineFetchLazyCore<App>(
  app: App,
  getFetchHandler: (app: App) => FetchHandler,
): asserts app is App & Fetchable {
  let fetchHandler: FetchHandler | null = null;
  Object.defineProperty(app, "fetch", {
    enumerable: true,
    get: () => {
      if (!fetchHandler) {
        fetchHandler = getFetchHandler(app);
      }
      return fetchHandler;
    },
  });
}
