import * as fs from "node:fs";
import equal from "@gilbarbara/deep-equal";
import { catchAllEntry } from "@universal-deploy/store";
import { assertFetchable, type Fetchable } from "@universal-deploy/store/utils";
import {
  type Environment,
  type EnvironmentModuleNode,
  type InlineConfig,
  mergeConfig,
  type Plugin,
  type UserConfig,
  type ViteDevServer,
} from "vite";
import type { ServerOptions } from "../types.js";

const savedOptsSymbol = Symbol.for("photon:saved-hmr-opts");

interface State {
  resolvedId: string;
  options?: UserConfig | undefined;
  config?: InlineConfig | undefined;
}

/**
 * Resolves catch-all entry and forwards config to vite devServer
 */
export function photonDevPlugin(): Plugin {
  let state: State | undefined;

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
      const last = readOptions(originalInlineConfig);
      // Avoids infinite restart loop
      if (last) {
        state = last;
        return;
      }

      const resolved = await server.pluginContainer.resolveId(catchAllEntry);
      if (!resolved) return;

      state = {
        resolvedId: resolved.id,
        config: originalInlineConfig,
      };

      const mod = await envImportFetchable<ServerOptions>(server, state.resolvedId);
      const options = mapServerOptionsToVite(mod, { logger: server.config.logger });
      state.options = options;
      if (!options) return;

      const inlineConfig = mergeConfig(originalInlineConfig, options);
      saveOptions(inlineConfig, state);
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
    async hotUpdate({ file, modules, read, server, timestamp }) {
      if (state?.resolvedId !== file) return;

      const invalidatedModules = new Set<EnvironmentModuleNode>();
      for (const mod of modules) {
        this.environment.moduleGraph.invalidateModule(mod, invalidatedModules, timestamp, true);
      }
      // Wait for updated file to be ready
      await read();

      const mod = await envImportFetchable<ServerOptions>(server, state.resolvedId);
      const options = mapServerOptionsToVite(mod, { logger: server.config.logger });

      if (!equal(state.options, options)) {
        const savedLastOptions = state.options;
        state.options = options;
        const inlineConfig = mergeConfig(state.config ?? {}, options ?? {});
        saveOptions(inlineConfig, state);
        Object.defineProperty(server.config, "inlineConfig", {
          get() {
            return inlineConfig;
          },
        });
        // If hostname or port changed, printUrls again
        server.restart().then(() => {
          if (
            savedLastOptions?.server?.port !== options?.server?.port ||
            savedLastOptions?.server?.host !== options?.server?.host
          ) {
            server.printUrls();
          }
        });
        return [];
      }

      return modules;
    },
  };
}

function saveOptions(
  // biome-ignore lint/suspicious/noExplicitAny: ok
  obj: any,
  options: State,
) {
  obj[savedOptsSymbol] = options;
}

function readOptions(
  // biome-ignore lint/suspicious/noExplicitAny: ok
  obj: any,
): State | undefined {
  return obj[savedOptsSymbol];
}

async function envImportFetchable<R extends object = object>(
  server: ViteDevServer,
  resolvedId: string,
): Promise<Fetchable & R> {
  const mod = await server.ssrLoadModule(resolvedId);
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
