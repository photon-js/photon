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
            // When using cloudflare, if you stumble upon the following error, you probably needs to exclude some
            // dependency from optimizeDeps: "There is a new version of the pre-bundle for [...]"
            optimizeDeps: {
              // TODO add @photonjs/*
              // TODO auto compute
              exclude: [
                "hono",
                "h3",
                "srvx",
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
                "@universal-middleware/srvx",
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
            "@photonjs/cloudflare",
            "@photonjs/core",
            "@photonjs/runtime",
            "@photonjs/h3",
            "@photonjs/elysia",
            "@photonjs/hono",
            "@photonjs/express",
            "@photonjs/fastify",
            "@photonjs/hattip",
            "@photonjs/srvx",
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
