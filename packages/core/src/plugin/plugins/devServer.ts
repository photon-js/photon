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
import { singleton } from "../utils/dedupe.js";
import { isPhotonMeta, isPhotonMetaConfig } from "../utils/entry.js";
import { logViteInfo } from "../utils/logVite.js";

let fixApplied = false;

const RESTART_EXIT_CODE = 33;
const IS_RESTARTER_SET_UP = "__PHOTON__IS_RESTARTER_SET_UP";

// Vite's isRunnableDevEnvironment isn't reliable when multiple Vite versions are installed
export function isRunnableDevEnvironment(environment: Environment): environment is RunnableDevEnvironment {
  return "runner" in environment;
}

export function devServer(config?: Photon.Config): Plugin {
  let resolvedEntryId: string;
  let viteDevServer: ViteDevServer;

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

        if (resolvedPhotonConfig.hmr === false) {
          return {
            appType: "custom",
            server: {
              middlewareMode: true,
              hmr: false,
            },
          };
        }

        return {
          appType: "custom",
          server: {
            middlewareMode: true,
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
      if (ctx.server.config.photon.devServer === false) return;
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
          assertUsage(isRunnableDevEnvironment(env), `${envName} environment is not runnable`);
          envImport(env, resolvedEntryId);
        });

        // Uncomment to forward full-reload to client
        // env.hot.on("photon:reloaded", () => {
        //   vite.environments.client.hot.send({ type: "full-reload" });
        // });
      }

      viteDevServer = vite;
      globalStore.viteDevServer = vite;
      if (!fixApplied) {
        fixApplied = true;
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

  function isImported(modules: EnvironmentModuleNode[]): { module: EnvironmentModuleNode } | undefined {
    const modulesSet = new Set(modules);
    for (const module of modulesSet.values()) {
      if (
        module.file === resolvedEntryId ||
        (isPhotonMeta(module.info?.meta) && module.info.meta.photon.type === "server") ||
        (isPhotonMetaConfig(module.info?.meta) && module.info.meta.photonConfig.isGlobal)
      ) {
        return {
          module,
        };
      }
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

    const indexResolved = await env.pluginContainer.resolveId("virtual:photon:serve-entry");
    assertUsage(
      indexResolved?.id,
      `Cannot find server entry. Make sure its path is relative to the root of your project.`,
    );
    resolvedEntryId = indexResolved.id;
    assertUsage(isRunnableDevEnvironment(env), `${envName} environment is not runnable`);
    return envImport(env, resolvedEntryId);
  }
}

function envImport<T>(env: RunnableDevEnvironment, resolvedId: string): Promise<T> {
  return env.runner
    .import(resolvedId)
    .then((mod) => {
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
