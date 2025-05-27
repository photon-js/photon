import type { App as HattipApp } from '@universal-middleware/hattip'

export function buildHandler<App extends HattipApp>(app: App) {
  const handler = app.buildHandler()
  handler[Symbol.for('photon:server')] = app[Symbol.for('photon:server')]
  return handler
}
