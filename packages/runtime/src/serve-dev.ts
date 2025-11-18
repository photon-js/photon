import userServerEntry from "virtual:photon:server-entry";
import { installServerHMR, isBun, isDeno, nodeServe, srvxServe } from "./serve-utils.js";
import { assertServerEntry } from "./utils.js";

async function startServer() {
  assertServerEntry(userServerEntry);

  if (isBun || isDeno || !userServerEntry.server?.nodeHandler) {
    const server = await srvxServe(userServerEntry);
    installServerHMR(() => server.serve());
    return server;
  }
  return nodeServe(userServerEntry.server?.options ?? {}, userServerEntry.server.nodeHandler);
}

await startServer();
