import maybeServerEntry from "virtual:ud:catch-all";
import { isBun, isDeno, nodeServe } from "./serve-utils.js";
import { assertServerEntry } from "./utils.js";

async function startServer() {
  assertServerEntry(maybeServerEntry);

  if (isBun || isDeno || !maybeServerEntry.server?.nodeHandler) {
    return await import("@universal-deploy/node/serve");
  }
  return nodeServe(maybeServerEntry.server?.options ?? {}, maybeServerEntry.server.nodeHandler);
}

await startServer();
