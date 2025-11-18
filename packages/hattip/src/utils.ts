import { defineFetchLazy as defineFetchLazyCore, type Fetchable, type FetchHandler } from "@photonjs/core/api/internal";
import type { App as HattipApp } from "@universal-middleware/hattip";

export function defineFetchLazy<App extends HattipApp>(app: App): asserts app is App & Fetchable {
  defineFetchLazyCore<App>(app, () => app.buildHandler() as unknown as FetchHandler);
}
