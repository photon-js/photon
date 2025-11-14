import userServerEntry from "virtual:photon:server-entry";
import { installServerHMR, isBun, isDeno, nodeServe, srvxServe } from "./serve-utils.js";

async function startServer() {
  if (!userServerEntry) {
    throw new Error("Missing export default in virtual:photon:server-entry");
  }

  if (isBun || isDeno || !userServerEntry.server?.nodeHandler) {
    const server = await srvxServe(userServerEntry);
    installServerHMR(() => server.serve());
    return server;
  }
  return nodeServe(userServerEntry.server?.options ?? {}, userServerEntry.server.nodeHandler);
}

await startServer();
