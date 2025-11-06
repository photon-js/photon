import { defineFetchLazy as defineFetchLazyCore } from "@photonjs/core/api/internal";
import type { App as HattipApp } from "@universal-middleware/hattip";

export function defineFetchLazy<App extends HattipApp>(app: App): App {
  const hattipHandler = app.buildHandler();
  ensurePhotonServer<App>(hattipHandler, app);
  defineFetchLazyCore<App>(app, () => hattipHandler);
  defineFetchLazyCore<App>(hattipHandler, () => hattipHandler);

  return hattipHandler;
}

function ensurePhotonServer<T>(newApp: T, app: T): T {
  // biome-ignore lint/suspicious/noExplicitAny: any
  (newApp as any)[Symbol.for("photon:server")] = (app as any)[Symbol.for("photon:server")];
  return newApp;
}
