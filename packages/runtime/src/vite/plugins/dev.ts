import type { Plugin } from "vite";

export function photonDevPlugin(): Plugin {
  let userPort: number | undefined;
  let userHost: string | boolean | undefined;
  return {
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
  };
}
