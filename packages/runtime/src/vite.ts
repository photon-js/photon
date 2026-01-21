import type { Plugin } from "vite";

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
