declare module "virtual:ud:catch-all?default" {
  export default {
    fetch(request: Request): Response | Promise<Response> {},
  };
}
