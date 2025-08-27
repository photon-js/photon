import type { ServerOptions } from "@photonjs/core/serve";
import type { App as HattipApp } from "@universal-middleware/hattip";
import { buildHandler } from "./utils.js";

export function serve<App extends HattipApp>(app: App, _options: ServerOptions = {}) {
  return buildHandler(app);
}
