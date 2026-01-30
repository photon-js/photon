import { cloudflare } from "@cloudflare/vite-plugin";
import config from "./vite.config";

config.plugins ??= [];
config.plugins.push(
  cloudflare({
    viteEnvironment: {
      name: "ssr",
    },
    inspectorPort: false,
  }),
);

export default config;
