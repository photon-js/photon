import userServerEntry from "virtual:photon:server-entry";
import { isBun, isDeno, nodeServe, srvxServe } from "./serve-utils.js";
import { assertServerEntry } from "./utils.js";

function startServer() {
  assertServerEntry(userServerEntry);

  if (isBun || isDeno || !userServerEntry.server?.nodeHandler) {
    return srvxServe(userServerEntry);
  }
  return nodeServe(userServerEntry.server?.options ?? {}, userServerEntry.server.nodeHandler);
}

await startServer();
