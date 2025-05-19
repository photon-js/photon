import type { ExportedHandlerFetchHandler } from '@cloudflare/workers-types'
import type { apply as applyAdapter } from '@universal-middleware/h3'
import { toWebHandler } from 'h3'

export function asFetch<App extends Parameters<typeof applyAdapter>[0]>(app: App): ExportedHandlerFetchHandler {
  const handler = toWebHandler(app)

  // TODO websocket support https://v1.h3.dev/adapters/cloudflare#websocket-support
  return (request, env, ctx) =>
    handler(request as unknown as Request, {
      cloudflare: { env, ctx },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    }) as any
}
