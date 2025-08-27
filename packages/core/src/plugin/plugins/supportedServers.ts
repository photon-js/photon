import type { Plugin } from "vite";
import type { SupportedServers } from "../../validators/types.js";
import { importsToServer } from "../utils/servers.js";

export function supportedTargetServers(name: string, servers: SupportedServers[], recommend = "hono"): Plugin {
  const serversSet = new Set(servers);

  return {
    name: `photon:unsupported-servers:${name}`,
    enforce: "pre",

    resolveId(id) {
      if (importsToServer[id] && !serversSet.has(importsToServer[id])) {
        this.error(
          `[photon][${name}] \`${importsToServer[id]}\` is not supported while targetting \`${name}\`. We recommend using \`${recommend}\` instead.`,
        );
      }
    },
  };
}
