import { defineFetchLazy as defineFetchLazyCore, type Fetchable } from "@photonjs/core/api/internal";
import type { Handler } from "./types.js";

export function defineFetchLazy<App extends Handler>(app: App): asserts app is App & Fetchable {
  return defineFetchLazyCore<App>(app, () => app);
}
