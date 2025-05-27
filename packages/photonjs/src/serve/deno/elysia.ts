import type { App as ElysiaApp } from '@universal-middleware/elysia'
import { denoServe, type ServerOptionsBase } from '../utils.js'

export function serve<App extends ElysiaApp>(app: App, options: ServerOptionsBase = {}) {
  denoServe(options, app.fetch)

  return app
}
