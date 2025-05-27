import type { App as ExpressApp } from '@universal-middleware/express'
import type { ServerOptions } from '../utils.js'

export function serve<App extends ExpressApp>(app: App, _options: ServerOptions = {}) {
  return app
}
