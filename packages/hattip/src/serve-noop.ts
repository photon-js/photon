import type { ServerOptions } from "@photonjs/core/serve";
import type { App as HattipApp } from "@universal-middleware/hattip";
import { defineFetchLazy } from "./utils.js";

export function serve<App extends HattipApp>(app: App, _options: ServerOptions = {}) {
  return defineFetchLazy(app);
}
