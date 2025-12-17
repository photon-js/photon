import { cloudflare } from "@photonjs/cloudflare/vite";
import config from "./vite.common.config";

config.plugins ??= [];
// Enables building for Cloudflare Workers (development and deploy builds).
config.plugins.push(
  cloudflare({
    inspectorPort: false,
  }),
);

export default config;
