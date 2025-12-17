// Resolves to catchAllEntry
import userServerEntry from "virtual:photon:server-entry";
import sirv from "@universal-middleware/sirv/srvx";
import { serve as serveSrvx } from "srvx";
import { assertServerEntry } from "./utils.js";

function startServer() {
  assertServerEntry(userServerEntry);

  return serveSrvx({
    ...userServerEntry,
    middleware: [sirv("dist/client")],
  }).ready();
}

await startServer();
