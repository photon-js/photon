import type { ExportedHandlerFetchHandler, Response } from '@cloudflare/workers-types'
import type { apply as applyAdapter } from '@universal-middleware/h3'
import { toWebHandler } from 'h3'

async function tryImportCrossws() {
  try {
    const { default: wsAdapter } = await import('crossws/adapters/cloudflare')
    return wsAdapter
  } catch (e) {
    throw new Error('crossws is not installed', { cause: e })
  }
}

export function asFetch<App extends Parameters<typeof applyAdapter>[0]>(app: App): ExportedHandlerFetchHandler {
  const handler = toWebHandler(app)

  return async (request, env, ctx): Promise<Response> => {
    if (request.headers.get('upgrade') === 'websocket') {
      const wsAdapter = await tryImportCrossws()
      const { handleUpgrade } = wsAdapter(app.websocket)

      return await handleUpgrade(request, env, ctx)
    }

    return (await handler(request as unknown as Request, {
      cloudflare: { env, ctx },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    })) as any
  }
}
