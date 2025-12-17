import createNetlifyPlugin, { type NetlifyPluginOptions } from "@netlify/vite-plugin";
import { catchAllEntry } from "@photonjs/store";
import type { Plugin } from "vite";

const moduleId = "photon:netlify";

export function netlify(config?: NetlifyPluginOptions): Plugin[] {
  return [
    //    {
    //       name: `${moduleId}:config`,
    //       enforce: "pre",
    //       config: {
    //         handler() {
    //           return {
    //             photon: {
    //               /**
    //                * @netlify/vite-plugin does not support code splitting yet
    //                * @see https://docs.netlify.com/build/frameworks/frameworks-api/
    //                */
    //               codeSplitting: {
    //                 target: false,
    //               },
    //               emitEntry: false,
    //             },
    //           };
    //         },
    //       },
    //     },
    //     ...targetLoader("netlify", {
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
    // // Some examples in Netlify's documentation are using serverless-http for express
    // // and other node-specific frameworks compatibility, but that is not recommended by Photon.
    // supportedTargetServers("netlify", ["hono", "h3", "srvx"]),
    {
      name: `${moduleId}:apply-store`,
      apply: "build",
      enforce: "post",
      configEnvironment: {
        // Give some time to other plugins to declare an entry in the store
        order: "post",
        handler(name, env) {
          if (env.consumer !== "server" && name !== "ssr") return;

          return {
            build: {
              rollupOptions: {
                input: {
                  index: catchAllEntry,
                },
              },
            },
          };
        },
      },
    },
    // Currently, the netlify build plugin only checks bundle artifacts and looks for a unique `isEntry` chunk
    ...createNetlifyPlugin({
      ...config,
      build: {
        enabled: true,
        ...config?.build,
      },
    }),
  ];
}
