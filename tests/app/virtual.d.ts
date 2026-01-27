declare module "virtual:ud:catch-all?default" {
  export default {
    fetch(_request: Request): Response | Promise<Response> {},
  };
}
