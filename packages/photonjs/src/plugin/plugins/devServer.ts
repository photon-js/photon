import { createServer, type IncomingMessage, type Server } from 'node:http'
import type {
  DevEnvironment,
  Environment,
  EnvironmentModuleNode,
  Plugin,
  RunnableDevEnvironment,
  ViteDevServer,
} from 'vite'

import { fork } from 'node:child_process'
import pc from '@brillout/picocolors'
import { globalStore } from '../../runtime/globalStore.js'
import { assert, assertUsage } from '../../utils/assert.js'
import { isPhotonMetaConfig } from '../utils/entry.js'
import { isBun } from '../utils/isBun.js'
import { logViteInfo } from '../utils/logVite.js'

let fixApplied = false

const VITE_HMR_PATH = '/__vite_hmr'
const RESTART_EXIT_CODE = 33
const IS_RESTARTER_SET_UP = '__PHOTON__IS_RESTARTER_SET_UP'

// Vite's isRunnableDevEnvironment isn't reliable when multiple Vite versions are installed
export function isRunnableDevEnvironment(environment: Environment): environment is RunnableDevEnvironment {
  return 'runner' in environment
}

export function devServer(config?: Photon.Config): Plugin {
  let resolvedEntryId: string
  let HMRServer: ReturnType<typeof createServer> | undefined
  let viteDevServer: ViteDevServer
  let setupHMRProxyDone = false

  if (config?.devServer === false) {
    return {
      name: 'photon:devserver:disabled',
      configureServer() {
        globalStore.viteDevServer = false
      },
    }
  }

  return {
    name: 'photon:devserver',
    apply(_config, { command, mode }) {
      return command === 'serve' && mode !== 'test'
    },
    enforce: 'pre',
    config: {
      order: 'post',
      handler(userConfig) {
        if (userConfig.photon?.devServer === false) return
        // FIXME
        if (isBun) {
          return {
            appType: 'custom',
            server: {
              middlewareMode: true,
            },
          }
        }

        HMRServer = createServer()
        return {
          appType: 'custom',
          server: {
            middlewareMode: true,
            hmr: {
              server: HMRServer,
              path: VITE_HMR_PATH,
            },
          },
        }
      },
    },

    configResolved(config) {
      if (config.photon.hmr === 'prefer-restart') {
        return setupProcessRestarter()
      }
    },

    async hotUpdate(ctx) {
      const imported = isImported(ctx.modules)
      if (imported) {
        if (this.environment.config.photon.hmr === 'prefer-restart') {
          restartProcess()
        } else {
          const invalidatedModules = new Set<EnvironmentModuleNode>()
          for (const mod of ctx.modules) {
            this.environment.moduleGraph.invalidateModule(mod, invalidatedModules, ctx.timestamp, true)
          }

          invalidateEntry(this.environment, invalidatedModules, ctx.timestamp, true)
          // Wait for updated file to be ready
          await ctx.read()

          this.environment.hot.send({ type: 'full-reload' })
          return []
        }
      }
    },

    configureServer(vite) {
      if (vite.config.photon.devServer === false) return
      if (viteDevServer) {
        if (vite.config.photon.hmr === 'prefer-restart') {
          restartProcess()
        }
        return
      }

      if (vite.config.photon.hmr === true) {
        // Once existing server is closed and invalidated, reimport its updated entry file
        vite.environments.ssr.hot.on('photon:server-closed', () => {
          setupHMRProxyDone = false
          assertUsage(isRunnableDevEnvironment(vite.environments.ssr), 'SSR environment is not runnable')
          ssrImportAndCheckDefaultExport(vite.environments.ssr, resolvedEntryId)
        })

        vite.environments.ssr.hot.on('photon:reloaded', () => {
          vite.environments.client.hot.send({ type: 'full-reload' })
        })
      }

      viteDevServer = vite
      globalStore.viteDevServer = vite
      globalStore.setupHMRProxy = setupHMRProxy
      if (!fixApplied) {
        fixApplied = true
        // FIXME properly test this before enabling it, it currently swallows errors
        // setupErrorStackRewrite(vite)
        setupErrorHandlers()
      }
      patchViteServer(vite)
      if (
        config?.devServer === undefined ||
        (typeof config?.devServer === 'object' && config?.devServer?.autoServe !== false)
      ) {
        initializeServerEntry(vite)
      }
    },
  }

  // Bypass "vite dev" CLI checks on usage
  function patchViteServer(vite: ViteDevServer) {
    // @ts-ignore
    vite.httpServer = { on: () => {} }
    // @ts-ignore
    vite.listen = () => {}
    vite.printUrls = () => {}
  }

  function invalidateEntry(
    env: DevEnvironment,
    invalidatedModules?: Set<EnvironmentModuleNode>,
    timestamp?: number,
    isHmr?: boolean,
  ) {
    const entryModule = env.moduleGraph.getModuleById(resolvedEntryId)
    if (entryModule) {
      // Always invalidate server entry so that
      env.moduleGraph.invalidateModule(entryModule, invalidatedModules, timestamp, isHmr)
    }
  }

  function setupHMRProxy(req: IncomingMessage) {
    if (setupHMRProxyDone || isBun) {
      return false
    }

    setupHMRProxyDone = true
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const server = (req.socket as any).server as Server
    server.on('upgrade', (clientReq, clientSocket, wsHead) => {
      if (isHMRProxyRequest(clientReq)) {
        assert(HMRServer)
        HMRServer.emit('upgrade', clientReq, clientSocket, wsHead)
      }
    })
    // true if we need to send an empty Response waiting for the upgrade
    return isHMRProxyRequest(req)
  }

  function isHMRProxyRequest(req: IncomingMessage) {
    if (req.url === undefined) {
      return false
    }
    const url = new URL(req.url, 'http://example.com')
    return url.pathname === VITE_HMR_PATH
  }

  function isImported(modules: EnvironmentModuleNode[]): { module: EnvironmentModuleNode } | undefined {
    const modulesSet = new Set(modules)
    for (const module of modulesSet.values()) {
      if (module.file === resolvedEntryId)
        return {
          module,
        }
      if (isPhotonMetaConfig(module.info?.meta) && module.info.meta.photonConfig.isGlobal)
        return {
          module,
        }
      // biome-ignore lint/complexity/noForEach: <explanation>
      module.importers.forEach((importer) => modulesSet.add(importer))
    }
  }

  async function initializeServerEntry(vite: ViteDevServer) {
    const index = vite.config.photon.server
    const indexResolved = await vite.environments.ssr.pluginContainer.resolveId(index.id, undefined, {
      isEntry: true,
    })
    assertUsage(
      indexResolved?.id,
      `Cannot find server entry ${pc.cyan(index.id)}. Make sure its path is relative to the root of your project.`,
    )
    resolvedEntryId = indexResolved.id
    const ssr = vite.environments.ssr
    assertUsage(isRunnableDevEnvironment(ssr), 'SSR environment is not runnable')
    ssrImportAndCheckDefaultExport(ssr, resolvedEntryId)
  }
}

function ssrImportAndCheckDefaultExport(ssr: RunnableDevEnvironment, resolvedId: string) {
  ssr.runner
    .import(resolvedId)
    .then((mod) => {
      assertUsage(mod && 'default' in mod, `Missing export default in ${JSON.stringify(resolvedId)}`)
      assertUsage(
        !(mod.default instanceof Promise),
        `Replace \`export default\` by \`export default await\` in ${JSON.stringify(resolvedId)}`,
      )
      assertUsage(
        Symbol.for('photon:server') in mod.default,
        `{ apply } function needs to be called before export in ${JSON.stringify(resolvedId)}`,
      )
    })
    .catch(logRestartMessage)
}

function logRestartMessage(err?: unknown) {
  if (err) {
    console.error(err)
  }
  logViteInfo('Server crash: Update a server file or type "r+enter" to restart the server.')
}

function setupErrorStackRewrite(vite: ViteDevServer) {
  const rewroteStacktraces = new WeakSet()

  const _prepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = function prepareStackTrace(error: Error, stack: NodeJS.CallSite[]) {
    let ret = _prepareStackTrace?.(error, stack)
    if (!ret) return ret
    try {
      ret = vite.ssrRewriteStacktrace(ret)
      rewroteStacktraces.add(error)
    } catch (e) {
      console.debug('Failed to apply Vite SSR stack trace fix:', e)
    }
    return ret
  }

  const _ssrFixStacktrace = vite.ssrFixStacktrace
  vite.ssrFixStacktrace = function ssrFixStacktrace(e) {
    if (rewroteStacktraces.has(e)) return
    _ssrFixStacktrace(e)
  }
}

function setupErrorHandlers() {
  function onError(err: unknown) {
    console.error(err)
    logRestartMessage()
  }

  process.on('unhandledRejection', onError)
  process.on('uncaughtException', onError)
}

// We hijack the CLI root process: we block Vite and make it orchestrates server restarts instead.
// We execute the CLI again as a child process which does the actual work.
async function setupProcessRestarter() {
  if (isRestarterSetUp()) return
  process.env[IS_RESTARTER_SET_UP] = 'true'

  function start() {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const cliEntry = process.argv[1]!
    const cliArgs = process.argv.slice(2)
    // Re-run the exact same CLI
    const clone = fork(cliEntry, cliArgs, { stdio: 'inherit' })
    clone.on('exit', (code) => {
      if (code === RESTART_EXIT_CODE) {
        start()
      } else {
        process.exit(code)
      }
    })
  }
  start()

  // Trick: never-resolving-promise in order to block the CLI root process
  await new Promise(() => {})
}

function isRestarterSetUp() {
  return process.env[IS_RESTARTER_SET_UP] === 'true'
}

function restartProcess() {
  logViteInfo('Restarting server...')
  assert(isRestarterSetUp())
  process.exit(RESTART_EXIT_CODE)
}
