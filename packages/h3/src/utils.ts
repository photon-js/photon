import { defineFetchLazy as defineFetchLazyCore, type Fetchable } from "@photonjs/core/api/internal";
import type { App as H3App } from "@universal-middleware/h3";
import { toWebHandler } from "h3";

export function defineFetchLazy<App extends H3App>(app: App): asserts app is App & Fetchable {
  return defineFetchLazyCore<App>(app, toWebHandler);
}
