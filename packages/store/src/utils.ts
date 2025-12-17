import type { Plugin } from "vite";
import { catchAllId } from "./const.js";

export const pluginsUsage = {
  [catchAllId]: "@photonjs/store/catch-all",
} as const;

export function dependsOn(pluginName: keyof typeof pluginsUsage): Partial<Plugin> {
  return {
    configResolved(config) {
      if (!config.plugins.some(({ name }) => name === pluginName)) {
        this.error(`"${pluginName}" Vite plugin is missing. Install it from "${pluginsUsage[pluginName]}".`);
      }
    },
  };
}
