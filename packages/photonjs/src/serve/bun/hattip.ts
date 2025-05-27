import type { App as HattipApp } from '@universal-middleware/hattip'
import { bunServe, type ServerOptions } from '../utils.js'

export function serve<App extends HattipApp>(app: App, options: ServerOptions = {}) {
  const handler = app.buildHandler()
  bunServe(options, (request) => {
    return handler({
      request,
      ip: '',
      passThrough() {
        // No op
      },
      waitUntil() {
        // No op
      },
      platform: { name: 'bun' },
      env(variable: string) {
        return process.env[variable]
      },
    })
  })

  return handler
}
