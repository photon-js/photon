declare module "virtual:photon:entry" {
  const mod: {
    fetch: (request: Request) => Response | Promise<Response>;
  };

  export default mod;
}
