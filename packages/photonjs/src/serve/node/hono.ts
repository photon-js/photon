import { serve as honoServe } from '@hono/node-server'
import type { App as HonoApp } from '@universal-middleware/hono'
import type { MergedHonoServerOptions } from '../noop/hono-types.js'
import { getPort, installServerHMR, onReady } from '../utils.js'

export function serve<App extends HonoApp>(app: App, options: MergedHonoServerOptions = {}) {
  const serverOptions = options.serverOptions ?? {}
  const isHttps = Boolean('cert' in serverOptions && serverOptions.cert)
  function _serve() {
    const port = getPort(options)
    const server = honoServe(
      {
        overrideGlobalObjects: options?.overrideGlobalObjects ?? false,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        ...(options as any),
        port,
        hostname: options?.hostname,
        fetch: app.fetch,
      },
      onReady({ isHttps, ...options, port }),
    )
    // onCreate hook
    options.onCreate?.(server)
    return server
  }

  if (import.meta.hot) {
    installServerHMR(_serve)
  } else {
    _serve()
  }

  return app
}
