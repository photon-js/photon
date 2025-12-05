import createNetlifyPlugin, { type NetlifyPluginOptions } from "@netlify/vite-plugin";
import { supportedTargetServers, targetLoader } from "@photonjs/core/vite";
import type { Plugin } from "vite";

const moduleId = "photon:netlify";

export function netlify(config?: NetlifyPluginOptions): Plugin[] {
  return [
    {
      name: `${moduleId}:config`,
      enforce: "pre",
      config: {
        handler() {
          return {
            photon: {
              /**
               * @netlify/vite-plugin does not support code splitting yet
               * @see https://docs.netlify.com/build/frameworks/frameworks-api/
               */
              codeSplitting: {
                target: false,
              },
              emitEntry: false,
            },
          };
        },
      },
    },
    ...targetLoader("netlify", {
      async load(id) {
        return {
          // language=ts
          code: `import entry from ${JSON.stringify(id)};

export default {
  ...entry
};
export * from ${JSON.stringify(id)};`,
          map: { mappings: "" },
        };
      },
    }),
    // Some examples in Netlify's documentation are using serverless-http for express
    // and other node-specific frameworks compatibility, but that is not recommended by Photon.
    supportedTargetServers("netlify", ["hono", "h3", "srvx"]),
    ...createNetlifyPlugin({
      ...config,
      build: {
        enabled: true,
        ...config?.build,
      },
    }),
  ];
}
