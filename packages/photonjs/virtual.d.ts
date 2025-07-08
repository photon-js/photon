declare module 'photon:fallback-entry' {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handler: any
  export default handler
}

declare module 'photon:get-middlewares:*' {
  export const getUniversalEntries: () => import('@universal-middleware/core').UniversalHandler[]
  export const getUniversalMiddlewares: () => import('@universal-middleware/core').UniversalMiddleware[]
}
