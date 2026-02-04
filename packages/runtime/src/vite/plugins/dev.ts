import * as fs from "node:fs";
import { catchAllEntry } from "@universal-deploy/store";
import { assertFetchable, type Fetchable } from "@universal-deploy/store/utils";
import { type Environment, mergeConfig, type Plugin, type RunnableDevEnvironment, type UserConfig } from "vite";
import type { ServerOptions } from "../types.js";

// Vite's isRunnableDevEnvironment isn't reliable when multiple Vite versions are installed
export function isRunnableDevEnvironment(environment: Environment): environment is RunnableDevEnvironment {
  return "runner" in environment;
}

const alreadySetSymbol = Symbol.for("photon:dev-server");

/**
 * Resolves catch-all entry and forwards config to vite devServer
 */
export function photonDevPlugin(): Plugin {
  return {
    name: "photon:dev-server",
    perEnvironmentStartEndDuringDev: true,
    apply(_config, { command, mode }) {
      return command === "serve" && mode !== "test";
    },
    applyToEnvironment(env) {
      return env.config.consumer === "server";
    },
    async configureServer(server) {
      const originalInlineConfig = server.config.inlineConfig;
      if ((originalInlineConfig as any)[alreadySetSymbol]) return;
      console.log("configureServer");

      const resolved = await server.pluginContainer.resolveId(catchAllEntry);
      if (!resolved) return;

      const env = Object.values(server.environments).find((x) => {
        return isRunnableDevEnvironment(x) && x.config.consumer === "server";
      }) as RunnableDevEnvironment | undefined;

      if (!env) {
        server.config.logger.warn(
          "Warning: Could not load server configuration. Vite dev server will use default settings.",
        );
        return;
      }

      const mod = await envImportFetchable<ServerOptions>(env, resolved.id);
      const options = mapServerOptionsToVite(mod, { logger: env.logger });

      const inlineConfig = mergeConfig(originalInlineConfig ?? {}, options ?? {});
      (inlineConfig as any)[alreadySetSymbol] = true;
      Object.defineProperty(server.config, "inlineConfig", {
        get() {
          return inlineConfig;
        },
      });
      const printUrlsO = server.printUrls;
      const bindCLIShortcutsO = server.bindCLIShortcuts;
      server.printUrls = () => {};
      server.bindCLIShortcuts = () => {};
      server.restart().then(() => {
        server.printUrls = printUrlsO;
        server.bindCLIShortcuts = bindCLIShortcutsO;
        server.printUrls();
        server.bindCLIShortcuts({
          print: true,
        });
      });
    },
  };
}

async function envImportFetchable<R extends object = object>(
  env: RunnableDevEnvironment,
  resolvedId: string,
): Promise<Fetchable & R> {
  const mod = await env.runner.import<unknown>(resolvedId);
  return assertFetchable(mod, resolvedId) as Fetchable & R;
}

function mapServerOptionsToVite(
  opts: unknown,
  { logger }: { logger: Pick<Environment["logger"], "warn" | "info" | "error"> },
): UserConfig | undefined {
  const viteConfig: Required<Pick<UserConfig, "server">> & Omit<UserConfig, "server"> = {
    server: {},
  };
  if (opts && typeof opts === "object") {
    const srvxOptions = opts as ServerOptions;

    // Core mappings
    if (srvxOptions.port !== undefined) {
      viteConfig.server.port = typeof srvxOptions.port === "string" ? parseInt(srvxOptions.port, 10) : srvxOptions.port;
    }

    if (srvxOptions.hostname !== undefined) {
      viteConfig.server.host = srvxOptions.hostname;
    }

    // HTTPS mapping with better error handling
    if (srvxOptions.protocol === "https" || srvxOptions.tls) {
      viteConfig.server.https = {};

      try {
        if (srvxOptions.tls?.cert) {
          const isFilePath = !srvxOptions.tls.cert.includes("\n") && !srvxOptions.tls.cert.startsWith("-----BEGIN");
          viteConfig.server.https.cert = isFilePath
            ? fs.readFileSync(srvxOptions.tls.cert, "utf-8")
            : srvxOptions.tls.cert;
        }

        if (srvxOptions.tls?.key) {
          const isFilePath = !srvxOptions.tls.key.includes("\n") && !srvxOptions.tls.key.startsWith("-----BEGIN");
          viteConfig.server.https.key = isFilePath
            ? fs.readFileSync(srvxOptions.tls.key, "utf-8")
            : srvxOptions.tls.key;
        }
      } catch (error) {
        throw new Error(`Failed to read TLS certificates`, { cause: error });
      }

      if (srvxOptions.tls?.passphrase) {
        logger.warn("Warning: TLS passphrase is not supported in Vite");
      }

      if (srvxOptions.silent) {
        viteConfig.logLevel = "silent";
      }
    }

    // TODO: Middleware
    // if ((srvxOptions.middleware?.length ?? 0) > 0) {
    //   viteConfig.plugins.push(createMiddleware(srvxOptions.middleware[0]))
    // }

    // TODO: Error handler?
    // if (srvxOptions.error) {
    //   viteConfig.plugins.push(createErrorHandlerPlugin(srvxOptions.error));
    // }

    // Warnings
    if (srvxOptions.bun) logger.warn("Warning: Bun options not applicable to Vite");
    if (srvxOptions.deno) logger.warn("Warning: Deno options not applicable to Vite");
    if (srvxOptions.node?.http2) logger.warn("Warning: HTTP/2 requires HTTPS in Vite");

    if (Object.keys(viteConfig).length > 1 || Object.keys(viteConfig.server).length > 0) {
      return viteConfig;
    }
  }
}
