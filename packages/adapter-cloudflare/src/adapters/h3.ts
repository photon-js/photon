import type { ExportedHandlerFetchHandler, Response } from '@cloudflare/workers-types'
import type { App } from '@universal-middleware/h3'
import { toWebHandler } from 'h3'
import { createMissingDependencyError } from '../utils/errors.js'

async function tryImportCrossws() {
  try {
    const { default: wsAdapter } = await import('crossws/adapters/cloudflare')
    return wsAdapter
  } catch (e) {
    throw createMissingDependencyError('crossws', e)
  }
}

export function asFetch(app: App): ExportedHandlerFetchHandler {
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
