declare module "virtual:photon:entry" {
  export default {
    fetch(_request: Request): Response | Promise<Response> {},
  };
}
