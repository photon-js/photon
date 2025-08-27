import type { App as HattipApp } from "@universal-middleware/hattip";
import { buildHandler } from "../symbol-utils.js";
import type { ServerOptions } from "../utils.js";

export function serve<App extends HattipApp>(app: App, _options: ServerOptions = {}) {
  return buildHandler(app);
}
