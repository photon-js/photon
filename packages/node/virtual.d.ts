declare module "virtual:photon:server-entry" {
  type FetchHandler = (request: Request) => Response | Promise<Response>;
  const handler: { fetch: FetchHandler };
  export default handler;
}
