import type { App as HattipApp } from '@universal-middleware/hattip'
import type { ServerOptions } from '../utils.js'

export function serve<App extends HattipApp>(app: App, _options: ServerOptions = {}) {
  const handler = app.buildHandler()
  handler[Symbol.for('photon:server')] = app[Symbol.for('photon:server')]
  return handler
}
