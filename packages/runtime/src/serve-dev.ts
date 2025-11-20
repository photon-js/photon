import userServerEntry from "virtual:photon:server-entry";
import { installServerHMR, isBun, isDeno, nodeServe, srvxServe } from "./serve-utils.js";
import { assertServerEntry } from "./utils.js";

async function startServer() {
  assertServerEntry(userServerEntry);

  const _serve =
    isBun || isDeno || !userServerEntry.server?.nodeHandler
      ? // biome-ignore lint/style/noNonNullAssertion: already asserted
        () => srvxServe(userServerEntry!)
      : () =>
          // biome-ignore lint/style/noNonNullAssertion: already asserted
          nodeServe(userServerEntry!.server?.options ?? {}, userServerEntry!.server!.nodeHandler!);

  return installServerHMR(_serve);
}

await startServer();
