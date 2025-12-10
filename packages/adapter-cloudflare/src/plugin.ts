import { cloudflare as cloudflareVitePlugins, type PluginConfig } from "@cloudflare/vite-plugin";
import type { Plugin } from "vite";

// const moduleId = "photon:cloudflare";

export function cloudflare(config?: PluginConfig): Plugin[] {
  // Default env to "ssr", which is what most frameworks are using
  const defaultBuildEnv = config?.viteEnvironment?.name ?? "ssr";

  return [
    //     {
    //       name: `${moduleId}:config`,
    //       enforce: "pre",
    //       config: {
    //         handler() {
    //           return {
    //             photon: {
    //               // @cloudflare/vite-plugin has its own dev server
    //               devServer: false,
    //               codeSplitting: {
    //                 target: false,
    //               },
    //               defaultBuildEnv,
    //               // Cloudflare emits its own index entry
    //               emitEntry: false,
    //             },
    //           };
    //         },
    //       },
    //     },
    //     {
    //       name: `${moduleId}:shorthand`,
    //
    //       resolveId: {
    //         order: "pre",
    //         filter: {
    //           // User-facing module ID shorthand for wrangler config file
    //           id: /virtual:photon:cloudflare:server-entry/,
    //         },
    //
    //         handler(_id, importer, opts) {
    //           return this.resolve("virtual:photon:cloudflare:virtual:photon:server-entry", importer, opts);
    //         },
    //       },
    //
    //       sharedDuringBuild: true,
    //     },
    //     ...targetLoader("cloudflare", {
    //       async load(id) {
    //         return {
    //           // language=ts
    //           code: `import entry from ${JSON.stringify(id)};
    //
    // export default {
    //   ...entry
    // };
    // export * from ${JSON.stringify(id)};`,
    //           map: { mappings: "" },
    //         };
    //       },
    //     }),
    //     supportedTargetServers("cloudflare", ["hono", "h3", "srvx"]),
    ...cloudflareVitePlugins({
      ...config,
      viteEnvironment: { ...config?.viteEnvironment, name: defaultBuildEnv },
    }),
  ];
}
