import type { App as HattipApp } from '@universal-middleware/hattip'
import { buildHandler } from "../hattip-utils.js";
import { denoServe, type ServerOptions } from '../utils.js'

export function serve<App extends HattipApp>(app: App, options: ServerOptions = {}) {
  const handler = buildHandler(app)
  denoServe(options, (request) => {
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
