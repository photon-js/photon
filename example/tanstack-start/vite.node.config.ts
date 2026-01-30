import { node } from "@universal-deploy/node/vite";
import config from "./vite.config";

config.plugins ??= [];
config.plugins.push(node());

export default config;
