import type { App as HattipApp } from "@universal-middleware/hattip";

export function defineFetchLazy<App extends HattipApp>(app: App): asserts app is App & Fetchable {
  defineFetchLazyCore<App>(app, () => {
    const handler = app.buildHandler();
    return (request) => {
      return handler({
        request,
        get ip() {
          console.warn("`ctx.ip` is not implemented");
          return "";
        },
        waitUntil() {
          // Do nothing
        },
        passThrough() {
          // Do nothing
        },
        platform: {},
        env() {
          console.warn("`ctx.env()` is not implemented");
          return undefined;
        },
      });
    };
  });
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
