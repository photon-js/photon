import type { App as H3App } from '@universal-middleware/h3'
import type { ServerOptions } from '../utils.js'

export function serve<App extends H3App>(app: App, _options: ServerOptions = {}) {
  return app
}
