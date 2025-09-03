import { cloudflare as cloudflareVitePlugins, type PluginConfig } from "@cloudflare/vite-plugin";
import { supportedTargetServers, targetLoader } from "@photonjs/core/vite";
import type { Plugin } from "vite";

const moduleId = "photon:cloudflare";

export function cloudflare(config?: PluginConfig): Plugin[] {
  const defaultBuildEnv = config?.viteEnvironment?.name ?? "ssr";

  return [
    {
      name: `${moduleId}:config`,
      enforce: "pre",
      config: {
        handler() {
          return {
            photon: {
              // @cloudflare/vite-plugin has its own dev server
              devServer: false,
              codeSplitting: {
                target: false,
              },
              defaultBuildEnv,
            },
          };
        },
      },
    },
    ...targetLoader("cloudflare", {
      async load(id, { meta }) {
        const isDev = this.environment.config.command === "serve";

        // `server` usually exists only during build time
        if (meta.server) {
          return {
            // language=ts
            code: `import serverEntry from ${JSON.stringify(id)};
            import { asFetch } from "@photonjs/cloudflare/${meta.server}";

            export const fetch = asFetch(serverEntry);
            export default { fetch };
            `,
            map: { mappings: "" },
          };
        }

        if (isDev) {
          return {
            // language=ts
            code: `import serverEntry from ${JSON.stringify(id)};
import { asFetch } from "@photonjs/cloudflare/dev";

export const fetch = asFetch(serverEntry, ${JSON.stringify(id)});
export default { fetch };
`,
            map: { mappings: "" },
          };
        }

        return this.error(`[photon][cloudflare] Unable to load ${id}`);
      },
    }),
    supportedTargetServers("cloudflare", ["hono", "h3", "srvx"]),
    ...cloudflareVitePlugins({
      ...config,
      viteEnvironment: { ...config?.viteEnvironment, name: defaultBuildEnv },
    }),
  ];
}
