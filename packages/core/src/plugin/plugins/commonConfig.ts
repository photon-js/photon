import { defaultClientConditions, defaultExternalConditions, defaultServerConditions, type Plugin } from "vite";
import { singleton } from "../utils/dedupe.js";
import { isBun } from "../utils/isBun.js";
import { isDeno } from "../utils/isDeno.js";

export { commonConfig };

function commonConfig(): Plugin[] {
  return [
    singleton({
      name: "photon:common-config",

      config() {
        return {
          ssr: {
            // From Vite doc:
            // > If the dependency is small and is already valid ESM,
            // > you can exclude it and let the browser load it directly.
            optimizeDeps: {
              exclude: [
                "hono",
                "h3",
                "elysia",
                "@universal-middleware/cloudflare",
                "@universal-middleware/compress",
                "@universal-middleware/core",
                "@universal-middleware/elysia",
                "@universal-middleware/express",
                "@universal-middleware/fastify",
                "@universal-middleware/h3",
                "@universal-middleware/hattip",
                "@universal-middleware/hono",
                "@universal-middleware/sirv",
              ],
            },
          },
        };
      },

      configEnvironment(name, config) {
        if (!config.consumer) {
          config.consumer = name === "client" ? "client" : "server";
        }

        const defaultCondition = config.consumer === "client" ? defaultClientConditions : defaultServerConditions;

        let additionalResolveConfig: {
          externalConditions?: string[];
          conditions?: string[];
          noExternal?: string[];
        } = {};

        if (isBun) {
          additionalResolveConfig = {
            conditions: ["bun", ...defaultCondition],
            externalConditions: ["bun", ...defaultExternalConditions],
          };
        }

        if (isDeno) {
          additionalResolveConfig = {
            conditions: ["deno", ...defaultCondition],
            externalConditions: ["deno", ...defaultExternalConditions],
          };
        }

        // do not override `noExternal: true`
        if (config.resolve?.noExternal !== true) {
          additionalResolveConfig.noExternal = [
            "@photonjs/core",
            "@photonjs/h3",
            "@photonjs/elysia",
            "@photonjs/hono",
            "@photonjs/express",
            "@photonjs/fastify",
            "@photonjs/hattip",
          ];
        }

        return {
          resolve: {
            ...additionalResolveConfig,
          },
          build: {
            target: "es2022",
          },
        };
      },
    }),
    singleton({
      name: "photon:set-after-build-start",
      enforce: "post",
      buildStart: {
        order: "post",
        handler() {
          Object.defineProperty(this.environment.config, "afterBuildStart", {
            get() {
              return true;
            },
          });
        },
      },
    }),
  ];
}
