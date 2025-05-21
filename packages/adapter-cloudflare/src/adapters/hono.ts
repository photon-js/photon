import type { ExportedHandlerFetchHandler } from '@cloudflare/workers-types'
import type { apply as applyAdapter } from '@universal-middleware/hono'

export function asFetch<App extends Parameters<typeof applyAdapter>[0]>(app: App): ExportedHandlerFetchHandler {
  return app.fetch as unknown as ExportedHandlerFetchHandler
}
