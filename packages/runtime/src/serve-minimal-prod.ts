// Resolves to catchAllEntry
import userServerEntry from "virtual:photon:server-entry";
import sirv from "@universal-middleware/sirv/srvx";
import { srvxServe } from "./serve-utils.js";
import { assertServerEntry } from "./utils.js";

function startServer() {
  assertServerEntry(userServerEntry);

  return srvxServe({
    ...userServerEntry,
    middleware: [sirv("dist/client")],
  });
}

await startServer();
