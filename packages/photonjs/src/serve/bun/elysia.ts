import type { App as ElysiaApp } from '@universal-middleware/elysia'
import type { Serve } from 'elysia/universal'
import { getPort, onReady, type ServerOptionsBase } from '../utils.js'

export function serve<App extends ElysiaApp>(app: App, options: ServerOptionsBase = {}) {
  const port = getPort(options)

  return app.listen(
    {
      port,
      hostname: options?.hostname,
    } as Partial<Serve>,
    onReady({ ...options, port }),
  )
}
