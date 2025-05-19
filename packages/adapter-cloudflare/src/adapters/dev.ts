import type { ExportedHandlerFetchHandler } from '@cloudflare/workers-types'

export function asFetch(app: unknown, id: string): ExportedHandlerFetchHandler {
  if (!app) {
    throw new Error(`[photon] Missing export default in ${JSON.stringify(id)}`)
  }

  const server = (app as Record<symbol, string | undefined>)[Symbol.for('photon:server')]

  if (!server) {
    throw new Error('[photon] { apply } function needs to be called before export')
  }

  switch (server) {
    case 'hono':
      return async (request, env, ctx) => {
        // @ts-ignore
        // biome-ignore lint/suspicious/noExplicitAny: self reference
        const { asFetch } = (await import('@photonjs/cloudflare/hono')) as any
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return asFetch(app as any)(request, env, ctx)
      }
    case 'h3':
      return async (request, env, ctx) => {
        // @ts-ignore
        // biome-ignore lint/suspicious/noExplicitAny: self reference
        const { asFetch } = (await import('@photonjs/cloudflare/h3')) as any
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return asFetch(app as any)(request, env, ctx)
      }
  }

  throw new Error(
    `[photon] Clouflare target is not compatible with server "${server}". We recommend using "hono" instead.`,
  )
}
