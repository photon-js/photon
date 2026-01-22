import type { Plugin } from "vite";

const re_enhanced = /[?&]enhanced\b/;
const re_catchAll = /^virtual:ud:catch-all\?default$/;

// Creates a server and listens for connections in Node/Deno/Bun
export function serve(): Plugin[] {
  let userPort: number | undefined;
  let userHost: string | boolean | undefined;
  return [
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
    },
    {
      name: "photon:wrap-enhance",
      enforce: "pre",

      resolveId: {
        filter: {
          id: [re_enhanced, /^virtual:ud:catch-all\?default$/],
        },
        async handler(id, importer) {
          if (importer?.match(re_enhanced)) return;
          if (id.match(re_catchAll)) {
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
        // TODO create an util in UM to compile enhance
        handler(id) {
          const wrappedModule = id.slice(1).replace(re_enhanced, "");

          if (!wrappedModule.match(re_catchAll)) {
            this.warn('?enhanced only supported by "virtual:ud:catch-all?default"');
            return;
          }

          return `import mod from ${JSON.stringify(wrappedModule)};
mod.fetch[Symbol.for("unPath")] = ${JSON.stringify("/**")};
mod.fetch[Symbol.for("unMethod")] = ${JSON.stringify("GET")};
export default mod;
          `;
        },
      },
    },
    {
      name: "photon:serve:transform-dev",
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
  ];
}
