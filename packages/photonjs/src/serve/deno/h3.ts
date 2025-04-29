import type { apply as applyAdapter } from '@universal-middleware/h3'
import { toWebHandler } from 'h3'
import { denoServe, type ServerOptions } from '../utils.js'

export function serve<App extends Parameters<typeof applyAdapter>[0]>(app: App, options: ServerOptions = {}) {
  denoServe(options, toWebHandler(app))

  return app
}
