import type {
  createServer as createServerHTTP,
  IncomingMessage,
  Server,
  ServerOptions as ServerOptionsHTTP,
  ServerResponse,
} from 'node:http'
import type {
  createSecureServer as createServerHTTP2,
  Http2SecureServer,
  Http2Server,
  Http2ServerRequest,
  Http2ServerResponse,
  SecureServerOptions as ServerOptionsHTTP2,
} from 'node:http2'
import type { createServer as createServerHTTPS, ServerOptions as ServerOptionsHTTPS } from 'node:https'
import type { Socket } from 'node:net'
import { assert } from '../utils/assert.js'

export type ServerType = Server | Http2Server | Http2SecureServer

export type ServerOptions = ServerOptionsBase &
  (ServerOptionsHTTPBase | ServerOptionsHTTPSBase | ServerOptionsHTTP2Base)

interface ServerOptionsHTTPBase {
  createServer?: typeof createServerHTTP
  serverOptions?: ServerOptionsHTTP
}

interface ServerOptionsHTTPSBase {
  createServer?: typeof createServerHTTPS
  serverOptions?: ServerOptionsHTTPS
}

interface ServerOptionsHTTP2Base {
  createServer?: typeof createServerHTTP2
  serverOptions?: ServerOptionsHTTP2
}

export interface ServerOptionsBase {
  /**
   * Server port
   */
  port?: number
  /**
   * Server hostname. Defaults to the server default value.
   */
  hostname?: string
  /**
   * Callback triggered when the server is listening for connections.
   * By default, it prints a message to the console.
   * Can be disabled by setting this to `false`
   */
  onReady?: Callback
  /**
   * Called when the server is created.
   * Only triggered when running on non-serverless environments.
   */
  onCreate?<Server extends ServerType | Deno.HttpServer | import('bun').Server>(server?: Server): void
  bun?: Omit<Parameters<typeof Bun.serve>[0], 'fetch' | 'port'>
  deno?: Omit<Deno.ServeTcpOptions | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem), 'port' | 'handler'>
}

type Handler = (req: Request) => Response | Promise<Response>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Callback = boolean | (() => any)

export interface NodeHandler {
  (req: IncomingMessage, res: ServerResponse, next?: (err?: unknown) => void): void
  (req: Http2ServerRequest, res: Http2ServerResponse, next?: (err?: unknown) => void): void
}

export function onReady(options: { port: number; isHttps?: boolean; onReady?: Callback }) {
  return () => {
    if (import.meta.hot) {
      if (import.meta.hot.data.vikeServerStarted) {
        // @ts-ignore conflict between bun and vite types
        import.meta.hot.send('photon:reloaded')
        return
      }
      import.meta.hot.data.vikeServerStarted = true
    }
    if (options?.onReady === true || options?.onReady === undefined) {
      console.log(`Server running at ${options.isHttps ? 'https' : 'http'}://localhost:${options.port}`)
    } else if (typeof options?.onReady === 'function') {
      options.onReady()
    }
  }
}

export function nodeServe(options: ServerOptions, handler: NodeHandler): ServerType {
  assert(options.createServer)
  const serverOptions = options.serverOptions ?? {}
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const createServer: any = options.createServer
  const server: ServerType = createServer(serverOptions, handler)
  // onCreate hook
  options.onCreate?.(server)
  const isHttps = Boolean('cert' in serverOptions && serverOptions.cert)
  const port = getPort(options)
  if (options?.hostname) {
    server.listen(port, options.hostname, onReady({ isHttps, ...options, port }))
  } else {
    server.listen(port, onReady({ isHttps, ...options, port }))
  }

  return server
}

export function denoServe(options: ServerOptions, handler: Handler) {
  const denoOptions = options.deno ?? {}
  const isHttps = 'cert' in denoOptions ? Boolean(denoOptions.cert) : false
  const port = getPort(options)
  const opts = { ...denoOptions, port, onListen: onReady({ isHttps, ...options, port }) }
  if (options.hostname) {
    opts.hostname = options.hostname
  }
  const server = Deno.serve(opts, handler)
  // onCreate hook
  options.onCreate?.(server)
}

export function bunServe(options: ServerOptions, handler: Handler) {
  const bunOptions = options.bun ?? {}
  const isHttps = 'tls' in bunOptions ? Boolean(bunOptions.tls) : false
  const port = getPort(options)
  const server = Bun.serve({ ...options.bun, port, hostname: options?.hostname, fetch: handler } as Parameters<
    typeof Bun.serve
  >[0])
  // onCreate hook
  options.onCreate?.(server)
  onReady({ isHttps, ...options, port })()
}

export function getPort(options?: ServerOptions) {
  return options?.port ?? 3000
}

/**
 * server.close() does not close existing connections.
 * The returned function forces all connections to close while closing the server.
 */
function onServerClose(server: Server | Http2Server | Http2SecureServer) {
  const connections: Set<Socket> = new Set()

  server.on('connection', (conn: Socket) => {
    connections.add(conn)
    conn.on('close', () => {
      connections.delete(conn)
    })
  })

  // biome-ignore lint/complexity/noForEach: <explanation>
  const closeAllConnections = () => connections.forEach((c) => c.destroy())

  return function destroy(cb: () => void) {
    server.close(cb)
    closeAllConnections()
  }
}

function _installServerHMR(server: Server | Http2Server | Http2SecureServer) {
  if (import.meta.hot) {
    const destroy = onServerClose(server)

    return new Promise<void>((resolve) => {
      const callback = () => {
        destroy(() => {
          resolve()
          // Signal that the server is properly closed, so that we can continue the hot-reload process
          // @ts-ignore conflict between bun and vite types
          import.meta.hot?.send('photon:server-closed')
        })
      }

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      import.meta.hot!.on('vite:beforeFullReload', callback)

      // Sent when vite server restarts
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      import.meta.hot!.on('photon:close-server', callback)
    })
  }
}

export function installServerHMR(serve: () => Server | Http2Server | Http2SecureServer) {
  // biome-ignore lint/style/noNonNullAssertion: asserted by wrapping function, and e2e tested
  const previousServerClosing: Promise<void> = import.meta.hot!.data.previousServerClosing ?? Promise.resolve()

  previousServerClosing.then(() => {
    const server = serve()
    // biome-ignore lint/style/noNonNullAssertion: asserted by wrapping function, and e2e tested
    import.meta.hot!.data.previousServerClosing = _installServerHMR(server)
  })
}
