import { node } from "@photonjs/node/vite";
import config from "./vite.common.config";

config.plugins ??= [];
// Enables building for server runtimes (Node, Bun, Deno).
config.plugins.push(node());

export default config;
