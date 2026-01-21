declare module "virtual:awesome-plugin:*" {
  // biome-ignore lint/suspicious/noExplicitAny: any
  const handler: any;
  export default handler;
}

declare module "virtual:ud:catch-all" {
  export default {
    fetch(request: Request): Response | Promise<Response> {},
  };
}
