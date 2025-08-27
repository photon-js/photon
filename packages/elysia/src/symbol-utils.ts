export function ensurePhotonServer<T>(newApp: T, app: T): T {
  // biome-ignore lint/suspicious/noExplicitAny: any
  (newApp as any)[Symbol.for("photon:server")] = (app as any)[Symbol.for("photon:server")];
  return newApp;
}
