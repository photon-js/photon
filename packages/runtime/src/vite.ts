import { compileEnhance } from "@universal-middleware/core";
import type { Plugin } from "vite";

const re_enhanced = /[?&]enhanced\b/;
const re_catchAll = /^virtual:ud:catch-all$/;
const re_catchAllDefault = /^virtual:ud:catch-all\?default$/;

export function photon(options: { entry: string }): Plugin[] {
  let userPort: number | undefined;
  let userHost: string | boolean | undefined;
  return [
    // Node compat
    {
      name: "photon:node:node-entry",
      apply: "build",

      resolveId: {
        order: "pre",
        filter: {
          id: /^virtual:photon:node-entry$/,
        },
        async handler(id, importer) {
          const resolved = await this.resolve("@photonjs/runtime/serve", importer);
          if (!resolved) {
            throw new Error(`Cannot find server entry ${JSON.stringify(id)}`);
          }

          return {
            id: resolved.id,
          };
        },
      },

      config() {
        return {
          ssr: {
            // Do not mark import("@universal-deploy/node/server") as external as it contains a virtual module
            noExternal: ["@universal-deploy/node"],
          },
        };
      },
    },
    {
      name: "photon:node:resolve-local-entry",
      resolveId: {
        order: "pre",
        filter: {
          id: re_catchAll,
        },
        handler() {
          // Will resolve the entry from the users project root
          return this.resolve(options.entry);
        },
      },
    },
    {
      name: "photon:node:transform-dev",
      apply: "serve",

      applyToEnvironment(env) {
        return env.config.consumer === "server";
      },

      config(userConfig) {
        userPort = userConfig.server?.port;
        userHost = userConfig.server?.host;
      },

      transform: {
        filter: {
          code: [/process\.env\.PORT/, /process\.env\.PHOTON_HOSTNAME/],
        },
        handler(code) {
          let newCode = code;
          let replaced = false;
          if (userPort) {
            newCode = newCode.replaceAll("process.env.PORT", JSON.stringify(String(userPort)));
            replaced = true;
          }
          if (typeof userHost === "string") {
            newCode = newCode.replaceAll("process.env.PHOTON_HOSTNAME", JSON.stringify(String(userHost)));
            replaced = true;
          }
          if (replaced) {
            return newCode;
          }
        },
      },
    },
    {
      name: "photon:wrap-enhance",
      enforce: "pre",

      resolveId: {
        filter: {
          id: [re_enhanced, re_catchAllDefault],
        },
        async handler(id, importer) {
          if (importer?.match(re_enhanced)) return;
          if (id.match(re_catchAllDefault)) {
            const resolved = await this.resolve(id, importer, { skipSelf: true });
            if (resolved) {
              return `\0${resolved.id}&enhanced`;
            }
          }
          return `\0${id}`;
        },
      },
      load: {
        filter: {
          // biome-ignore lint/suspicious/noControlCharactersInRegex: ok
          id: [/^\x00.*[?&]enhanced\b/],
        },
        handler(id) {
          const wrappedModule = id.slice(1).replace(re_enhanced, "");

          if (!wrappedModule.match(re_catchAllDefault)) {
            this.warn('?enhanced only supported by "virtual:ud:catch-all?default"');
            return;
          }

          const compiledEnhance = compileEnhance("mod.fetch", {
            path: "/**",
            method: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
          });

          return `
export * from ${JSON.stringify(wrappedModule)};
import mod from ${JSON.stringify(wrappedModule)};
${compiledEnhance}
export default mod;
          `;
        },
      },
    },
  ];
}
