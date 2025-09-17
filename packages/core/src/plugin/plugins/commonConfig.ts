import { defaultClientConditions, defaultExternalConditions, defaultServerConditions, type Plugin } from "vite";
import type { Photon } from "../../types.js";
import { resolvePhotonConfig } from "../../validators/coerce.js";
import { SupportedServers } from "../../validators/validators.js";
import { singleton } from "../utils/dedupe.js";
import { isBun } from "../utils/isBun.js";
import { isDeno } from "../utils/isDeno.js";

export { commonConfig };

function commonConfig(): Plugin[] {
  let resolvedPhotonConfig: Photon.ConfigResolved;
  return [
    singleton({
      name: "photon:optimize-deps",

      config: {
        order: "post",
        handler(userConfig) {
          resolvedPhotonConfig = resolvePhotonConfig(userConfig.photon);
        },
      },
      configEnvironment(name, config) {
        if (!config.consumer) {
          config.consumer = name === "client" ? "client" : "server";
        }

        if (config.consumer !== "server") return;
        const servers = Object.keys(SupportedServers.enum);

        // Photon can replace entries with virtual modules. If so, we need to ensure that `optimizeDeps.entries`
        // still points to users entries so that Vite can crawl them
        const entries = [resolvedPhotonConfig.server.id, ...resolvedPhotonConfig.entries.map((e) => e.id)]
          .filter(Boolean)
          .map((id) => id.replace(/^photon:(handler-entry|server-entry|server-config):/, ""));

        return {
          // From Vite doc:
          // > If the dependency is small and is already valid ESM,
          // > you can exclude it and let the browser load it directly.
          // When using cloudflare, if you stumble upon the following error, you probably needs to exclude some
          // dependency from optimizeDeps: "There is a new version of the pre-bundle for [...]"
          optimizeDeps: {
            entries,
            exclude: [
              "hono",
              "h3",
              "srvx",
              "elysia",
              ...servers.map((s) => `@universal-middleware/${s}`),
              "@universal-middleware/compress",
              "@universal-middleware/core",
              "@universal-middleware/sirv",
              "@universal-middleware/cloudflare",
              "@universal-middleware/vercel",
              ...servers.map((s) => `@photonjs/${s}`),
              "@photonjs/core",
              "@photonjs/runtime",
              "@photonjs/cloudflare",
              "@photonjs/vercel",
            ],
          },
        };
      },
    }),
    singleton({
      name: "photon:common-config",

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

        const buildTarget = config.consumer === "client" ? null : { build: { target: "es2022" } };

        return {
          resolve: {
            ...additionalResolveConfig,
          },
          ...buildTarget,
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
