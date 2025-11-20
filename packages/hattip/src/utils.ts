import { defineFetchLazy as defineFetchLazyCore, type Fetchable } from "@photonjs/core/api/internal";
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
