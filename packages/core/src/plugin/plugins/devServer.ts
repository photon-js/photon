import type { IncomingMessage, Server } from "node:http";
import {
  enhance,
  getUniversalProp,
  type HttpMethod,
  methodSymbol,
  nameSymbol,
  orderSymbol,
  pathSymbol,
  type UniversalHandler,
  type UniversalMiddleware,
} from "@universal-middleware/core";
import { cyan } from "ansis";
import type {
  DevEnvironment,
  Environment,
  EnvironmentModuleNode,
  Plugin,
  RunnableDevEnvironment,
  ViteDevServer,
} from "vite";
import { globalStore } from "../../runtime/globalStore.js";
import type { Photon } from "../../types.js";
import { assert, assertUsage } from "../../utils/assert.js";
import { resolvePhotonConfig } from "../../validators/coerce.js";
import type { PhotonEntryUniversalHandler, SupportedServers } from "../../validators/types.js";
import { singleton } from "../utils/dedupe.js";
import { isPhotonMetaConfig } from "../utils/entry.js";
import { isBun } from "../utils/isBun.js";
import { logViteInfo } from "../utils/logVite.js";

let fixApplied = false;

const VITE_HMR_PATH = "/__vite_hmr";
const RESTART_EXIT_CODE = 33;
const IS_RESTARTER_SET_UP = "__PHOTON__IS_RESTARTER_SET_UP";

// Vite's isRunnableDevEnvironment isn't reliable when multiple Vite versions are installed
export function isRunnableDevEnvironment(environment: Environment): environment is RunnableDevEnvironment {
  return "runner" in environment;
}

// TODO cleanup or reuse?
// biome-ignore lint/correctness/noUnusedVariables: TODO
async function importMiddleware(vite: ViteDevServer, middleware: string) {
  const envName = vite.config.photon.devServer ? vite.config.photon.devServer.env : "ssr";
  const env = vite.environments[envName];
  assertUsage(env, `Environment ${envName} not found`);
  assertUsage(isRunnableDevEnvironment(env), `Environment ${envName} is not runnable`);

  return envImportAndCheckDefaultExport<UniversalMiddleware | UniversalMiddleware[]>(env, middleware, false);
}

// biome-ignore lint/correctness/noUnusedVariables: TODO
async function importHandler(vite: ViteDevServer, handler: PhotonEntryUniversalHandler) {
  const envName = handler.env ?? "ssr";
  const env = vite.environments[envName];
  assertUsage(env, `Environment ${envName} not found`);
  assertUsage(isRunnableDevEnvironment(env), `Environment ${envName} is not runnable`);

  const handlerResolved = await env.pluginContainer.resolveId(handler.id, undefined, {
    isEntry: true,
  });
  assertUsage(
    handlerResolved?.id,
    `Cannot find handler ${pc.cyan(handler.id)}. Make sure its path is relative to the root of your project.`,
  );

  return envImportAndCheckDefaultExport<UniversalHandler>(env, handlerResolved.id, false).then((defaultExport) => {
    const name = getUniversalProp(defaultExport, nameSymbol);
    const path = getUniversalProp(defaultExport, pathSymbol);
    const order = getUniversalProp(defaultExport, orderSymbol);
    const method = getUniversalProp(defaultExport, methodSymbol);
    const toEnhance: { path?: string; method?: HttpMethod[] | HttpMethod; name?: string; order?: number } = {};
    if (handler.route) {
      toEnhance.path = handler.route;
      toEnhance.method = ["GET", "POST"];
    } else if (path) {
      toEnhance.path = path;
    }
    if (!name) {
      toEnhance.name = handlerResolved.id;
    } else {
      toEnhance.name = name;
    }
    if (order) {
      toEnhance.order = order;
    }
    if (method) {
      toEnhance.method = method;
    }
    return enhance((request, context, runtime) => {
      context.photon ??= {};
      context.photon.handler = handler;
      return defaultExport(request, context, runtime);
    }, toEnhance);
  });
}

export function devServer(config?: Photon.Config): Plugin {
  let resolvedEntryId: string;
  let HMRServer: Server | undefined;
  let viteDevServer: ViteDevServer;
  let setupHMRProxyDone = false;

  if (config?.devServer === false) {
    return {
      name: "photon:devserver:disabled",
      configureServer() {
        globalStore.viteDevServer = false;
      },
    };
  }

  return singleton({
    name: "photon:devserver",
    apply(_config, { command, mode }) {
      return command === "serve" && mode !== "test";
    },
    enforce: "post",
    config: {
      order: "post",
      async handler(userConfig) {
        const resolvedPhotonConfig = resolvePhotonConfig(userConfig.photon);
        if (resolvedPhotonConfig.devServer === false) return;
        // FIXME
        if (isBun) {
          return {
            appType: "custom",
            server: {
              middlewareMode: true,
            },
          };
        }

        const { createServer } = await import("node:http");

        HMRServer = createServer();
        return {
          appType: "custom",
          server: {
            middlewareMode: true,
            hmr: {
              server: HMRServer,
              path: VITE_HMR_PATH,
            },
          },
        };
      },
    },

    configResolved(config) {
      if (config.photon.hmr === "prefer-restart") {
        return setupProcessRestarter();
      }
    },

    async hotUpdate(ctx) {
      const imported = isImported(ctx.modules);
      if (imported) {
        if (this.environment.config.photon.hmr === "prefer-restart") {
          restartProcess();
        } else {
          const invalidatedModules = new Set<EnvironmentModuleNode>();
          for (const mod of ctx.modules) {
            this.environment.moduleGraph.invalidateModule(mod, invalidatedModules, ctx.timestamp, true);
          }

          invalidateEntry(this.environment, invalidatedModules, ctx.timestamp, true);
          // Wait for updated file to be ready
          await ctx.read();

          this.environment.hot.send({ type: "full-reload" });
          return [];
        }
      }
    },

    configureServer(vite) {
      if (vite.config.photon.devServer === false) return;
      if (viteDevServer) {
        if (vite.config.photon.hmr === "prefer-restart") {
          restartProcess();
        }
        return;
      }

      if (vite.config.photon.hmr === true) {
        const envName = vite.config.photon.devServer.env;
        const env = vite.environments[envName];
        assertUsage(env, `Environment ${envName} does not exists`);

        // Once existing server is closed and invalidated, reimport its updated entry file
        env.hot.on("photon:server-closed", () => {
          setupHMRProxyDone = false;
          assertUsage(isRunnableDevEnvironment(env), `${envName} environment is not runnable`);
          envImportAndCheckDefaultExport(env, resolvedEntryId);
        });

        env.hot.on("photon:reloaded", () => {
          // TODO do not full reload the client?
          vite.environments.client.hot.send({ type: "full-reload" });
        });
      }

      viteDevServer = vite;
      globalStore.viteDevServer = vite;
      globalStore.setupHMRProxy = setupHMRProxy;
      if (!fixApplied) {
        fixApplied = true;
        // FIXME properly test this before enabling it, it currently swallows errors
        // setupErrorStackRewrite(vite)
        setupErrorHandlers();
      }
      patchViteServer(vite);
      if (vite.config.photon.devServer.autoServe) {
        initializeServerEntry(vite);
      }
    },
  });

  // Bypass "vite dev" CLI checks on usage
  function patchViteServer(vite: ViteDevServer) {
    // @ts-expect-error
    vite.httpServer = { on: () => {} };
    // @ts-expect-error
    vite.listen = () => {};
    vite.printUrls = () => {};
  }

  function invalidateEntry(
    env: DevEnvironment,
    invalidatedModules?: Set<EnvironmentModuleNode>,
    timestamp?: number,
    isHmr?: boolean,
  ) {
    const entryModule = env.moduleGraph.getModuleById(resolvedEntryId);
    if (entryModule) {
      // Always invalidate server entry so that
      env.moduleGraph.invalidateModule(entryModule, invalidatedModules, timestamp, isHmr);
    }
  }

  function setupHMRProxy(req: IncomingMessage) {
    if (setupHMRProxyDone || isBun) {
      return false;
    }

    setupHMRProxyDone = true;
    // biome-ignore lint/suspicious/noExplicitAny: any
    const server = (req.socket as any).server as Server;
    server.on("upgrade", (clientReq, clientSocket, wsHead) => {
      if (isHMRProxyRequest(clientReq)) {
        assert(HMRServer);
        HMRServer.emit("upgrade", clientReq, clientSocket, wsHead);
      }
    });
    // true if we need to send an empty Response waiting for the upgrade
    return isHMRProxyRequest(req);
  }

  function isHMRProxyRequest(req: IncomingMessage) {
    if (req.url === undefined) {
      return false;
    }
    const url = new URL(req.url, "http://example.com");
    return url.pathname === VITE_HMR_PATH;
  }

  function isImported(modules: EnvironmentModuleNode[]): { module: EnvironmentModuleNode } | undefined {
    const modulesSet = new Set(modules);
    for (const module of modulesSet.values()) {
      if (module.file === resolvedEntryId)
        return {
          module,
        };
      if (isPhotonMetaConfig(module.info?.meta) && module.info.meta.photonConfig.isGlobal)
        return {
          module,
        };
      module.importers.forEach((importer) => {
        modulesSet.add(importer);
      });
    }
  }

  async function initializeServerEntry(vite: ViteDevServer) {
    assert(vite.config.photon.devServer);
    const envName = vite.config.photon.devServer.env;
    const env = vite.environments[envName];
    assertUsage(env, `Environment ${envName} does not exists`);

    const index = vite.config.photon.server;
    const indexResolved = await env.pluginContainer.resolveId(index.id, undefined, {
      isEntry: true,
    });
    assertUsage(
      indexResolved?.id,
      `Cannot find server entry ${cyan(index.id)}. Make sure its path is relative to the root of your project.`,
    );
    resolvedEntryId = indexResolved.id;
    assertUsage(isRunnableDevEnvironment(env), `${envName} environment is not runnable`);
    return envImportAndCheckDefaultExport(env, resolvedEntryId);
  }
}

const photonServerSymbol = Symbol.for("photon:server");

function envImportAndCheckDefaultExport(
  env: RunnableDevEnvironment,
  resolvedId: string,
): Promise<{ [photonServerSymbol]: SupportedServers }>;
function envImportAndCheckDefaultExport<T>(
  env: RunnableDevEnvironment,
  resolvedId: string,
  isServer: false,
): Promise<T>;
function envImportAndCheckDefaultExport(env: RunnableDevEnvironment, resolvedId: string, isServer = true) {
  return env.runner
    .import(resolvedId)
    .then((mod) => {
      assertUsage(mod && "default" in mod, `Missing export default in ${JSON.stringify(resolvedId)}`);
      assertUsage(
        !(mod.default instanceof Promise),
        `Replace \`export default\` by \`export default await\` in ${JSON.stringify(resolvedId)}`,
      );
      if (isServer) {
        assertUsage(
          photonServerSymbol in mod.default,
          `{ apply } function needs to be called before export in ${JSON.stringify(resolvedId)}`,
        );
      }
      return mod.default;
    })
    .catch(logRestartMessage);
}

function logRestartMessage(err?: unknown) {
  if (err) {
    console.error(err);
  }
  logViteInfo('Server crash: Update a server file or type "r+enter" to restart the server.');
}

// biome-ignore lint/correctness/noUnusedVariables: needed once usage uncommented
function setupErrorStackRewrite(vite: ViteDevServer) {
  const rewroteStacktraces = new WeakSet();

  const _prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function prepareStackTrace(error: Error, stack: NodeJS.CallSite[]) {
    let ret = _prepareStackTrace?.(error, stack);
    if (!ret) return ret;
    try {
      ret = vite.ssrRewriteStacktrace(ret);
      rewroteStacktraces.add(error);
    } catch (e) {
      console.debug("Failed to apply Vite SSR stack trace fix:", e);
    }
    return ret;
  };

  const _ssrFixStacktrace = vite.ssrFixStacktrace;
  vite.ssrFixStacktrace = function ssrFixStacktrace(e) {
    if (rewroteStacktraces.has(e)) return;
    _ssrFixStacktrace(e);
  };
}

function setupErrorHandlers() {
  function onError(err: unknown) {
    console.error(err);
    logRestartMessage();
  }

  process.on("unhandledRejection", onError);
  process.on("uncaughtException", onError);
}

// We hijack the CLI root process: we block Vite and make it orchestrates server restarts instead.
// We execute the CLI again as a child process which does the actual work.
async function setupProcessRestarter() {
  if (isRestarterSetUp()) return;
  process.env[IS_RESTARTER_SET_UP] = "true";

  async function start() {
    const cliEntry = process.argv[1];
    if (!cliEntry) {
      throw new Error("Unable to read argv[1]");
    }

    const cliArgs = process.argv.slice(2);

    const { fork } = await import("node:child_process");

    // Re-run the exact same CLI
    const clone = fork(cliEntry, cliArgs, { stdio: "inherit" });
    clone.on("exit", (code) => {
      if (code === RESTART_EXIT_CODE) {
        start();
      } else {
        process.exit(code);
      }
    });
  }
  await start();

  // Trick: never-resolving-promise in order to block the CLI root process
  await new Promise(() => {});
}

function isRestarterSetUp() {
  return process.env[IS_RESTARTER_SET_UP] === "true";
}

function restartProcess() {
  logViteInfo("Restarting server...");
  assert(isRestarterSetUp());
  process.exit(RESTART_EXIT_CODE);
}
