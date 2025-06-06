import type { App as H3App } from '@universal-middleware/h3'
import { createServer } from 'node:http'
import { toNodeListener } from 'h3'
import { installServerHMR, type NodeHandler, nodeServe, type ServerOptions } from '../utils.js'

export function serve<App extends H3App>(app: App, options: ServerOptions = {}) {
  if (!options.createServer) options.createServer = createServer
  const _serve = () => nodeServe(options, toNodeListener(app) as NodeHandler)

  if (import.meta.hot) {
    installServerHMR(_serve)
  } else {
    _serve()
  }

  return app
}
