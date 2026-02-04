declare module "virtual:photon:entry" {
  export default {
    // biome-ignore lint/correctness/noUnusedFunctionParameters: typings
    fetch: (request: Request) => Response | Promise<Response>,
  };
}
