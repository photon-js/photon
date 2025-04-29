import type { apply as applyAdapter } from '@universal-middleware/hono'
import type { MergedHonoServerOptions } from '../noop/hono-types.js'
import { denoServe } from '../utils.js'

export function serve<App extends Parameters<typeof applyAdapter>[0]>(app: App, options: MergedHonoServerOptions = {}) {
  denoServe(options, app.fetch)

  return app
}
