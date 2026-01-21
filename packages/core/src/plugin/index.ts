import type { Plugin } from "vite";
import type { Photon } from "../types.js";
import { devServer } from "./plugins/devServer.js";

export { photon, photon as default };

function photon(config?: Photon.Config): Plugin[] {
  return [devServer(config)];
}
