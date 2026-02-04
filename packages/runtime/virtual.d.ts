declare module "virtual:ud:catch-all" {
  export default {
    // biome-ignore lint/correctness/noUnusedFunctionParameters: typings
    fetch: (request: Request) => Response | Promise<Response>,
  };
}
