import { node } from '@elysiajs/node'
import type { App as ElysiaApp } from '@universal-middleware/elysia'
import { Elysia } from 'elysia'
import type { Serve } from 'elysia/universal'
import { ensurePhotonServer } from '../symbol-utils.js'
import { getPort, onReady, type ServerOptionsBase } from '../utils.js'

export function serve<App extends ElysiaApp>(app: App, options: ServerOptionsBase = {}) {
  // TODO HMR
  const port = getPort(options)
  return ensurePhotonServer(
    new Elysia({ adapter: node() }).mount(app).listen(
      {
        port,
        hostname: options?.hostname,
      } as Partial<Serve>,
      onReady({ ...options, port }),
    ),
    app,
  )
}
