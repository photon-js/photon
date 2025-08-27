import type { App as HattipApp } from "@universal-middleware/hattip";

export function buildHandler<App extends HattipApp>(app: App) {
  return ensurePhotonServer(app.buildHandler(), app);
}

function ensurePhotonServer<T>(newApp: T, app: T): T {
  // biome-ignore lint/suspicious/noExplicitAny: any
  (newApp as any)[Symbol.for("photon:server")] = (app as any)[Symbol.for("photon:server")];
  return newApp;
}
