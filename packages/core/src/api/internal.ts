export type FetchHandler = (request: Request) => Response | Promise<Response>;
export type Fetchable = { fetch: FetchHandler };

export function defineFetchLazy<App>(
  app: App,
  getFetchHandler: (app: App) => FetchHandler,
): asserts app is App & Fetchable {
  let fetchHandler: FetchHandler | null = null;
  Object.defineProperty(app, "fetch", {
    enumerable: true,
    get: () => {
      if (!fetchHandler) {
        fetchHandler = getFetchHandler(app);
      }
      return fetchHandler;
    },
  });
}
