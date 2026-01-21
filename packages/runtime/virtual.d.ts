declare module "virtual:photon:fallback-entry" {
  // biome-ignore lint/suspicious/noExplicitAny: any
  const handler: any;
  export default handler;
}

declare module "virtual:ud:catch-all" {
  const handler: undefined | import("@photonjs/core/serve").ServeReturn;
  export default handler;
}

declare module "virtual:photon:get-middlewares:*" {
  export const getUniversalEntries: () => import("@universal-middleware/core").UniversalHandler[];
  export const getUniversalMiddlewares: () => import("@universal-middleware/core").UniversalMiddleware[];
}
