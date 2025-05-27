import type { App as FastifyApp } from '@universal-middleware/fastify'
import type { ServerOptionsBase } from '../utils.js'

export function serve<App extends FastifyApp>(app: App, _options: ServerOptionsBase = {}) {
  return app
}
