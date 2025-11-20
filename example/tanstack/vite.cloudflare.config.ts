import { cloudflare } from "@photonjs/cloudflare/vite";
import config from "./vite.config";

config.plugins ??= [];
config.plugins.push(
  cloudflare({
    inspectorPort: false,
  }),
);

export default config;
