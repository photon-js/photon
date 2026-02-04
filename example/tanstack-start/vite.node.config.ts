import { node } from "@universal-deploy/node/vite";
import config from "./vite.config";

config.plugins ??= [];
config.plugins.push(
  node({
    static: "dist/client",
  }),
);

export default config;
