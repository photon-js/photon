import type {
  createServer as createServerHTTP,
  IncomingMessage,
  Server,
  ServerOptions as ServerOptionsHTTP,
  ServerResponse,
} from "node:http";
import nodeHTTP from "node:http";
import type {
  createSecureServer as createServerHTTP2,
  Http2SecureServer,
  Http2Server,
  Http2ServerRequest,
  Http2ServerResponse,
  SecureServerOptions as ServerOptionsHTTP2,
} from "node:http2";
import nodeHTTP2 from "node:http2";
import type { createServer as createServerHTTPS, ServerOptions as ServerOptionsHTTPS } from "node:https";
import type { Socket } from "node:net";
import type { ServeReturn } from "@photonjs/core/serve";
import type { Server as SrvxServer, ServerOptions as SrvxServerOptions } from "srvx";
import { serve as serveBun } from "srvx/bun";
import { serve as serveDeno } from "srvx/deno";
import { serve as serveNode } from "srvx/node";

export type ServerType = import("node:http").Server | Http2Server | Http2SecureServer;

export type ServerOptions = ServerOptionsBase &
  (ServerOptionsHTTPBase | ServerOptionsHTTPSBase | ServerOptionsHTTP2Base);

interface ServerOptionsHTTPBase {
  createServer?: typeof createServerHTTP;
  serverOptions?: ServerOptionsHTTP;
}

interface ServerOptionsHTTPSBase {
  createServer?: typeof createServerHTTPS;
  serverOptions?: ServerOptionsHTTPS;
}

interface ServerOptionsHTTP2Base {
  createServer?: typeof createServerHTTP2;
  serverOptions?: ServerOptionsHTTP2;
}

export interface ServerOptionsBase {
  /**
   * Server port
   */
  port?: number;
  /**
   * Server hostname. Defaults to the server default value.
   */
  hostname?: string;
  /**
   * Callback triggered when the server is listening for connections.
   * By default, it prints a message to the console.
   * Can be disabled by setting this to `false`
   */
  onReady?: Callback;
  /**
   * Called when the server is created.
   * Only triggered when running on non-serverless environments.
   */
  onCreate?<Server extends ServerType | Deno.HttpServer | import("bun").Server>(server?: Server): void;
  bun?: Omit<Parameters<typeof Bun.serve>[0], "fetch" | "port">;
  deno?: Omit<Deno.ServeTcpOptions | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem), "port" | "handler">;
}

export interface NodeHandler {
  (req: IncomingMessage, res: ServerResponse, next?: (err?: unknown) => void): void | Promise<void>;
  (req: Http2ServerRequest, res: Http2ServerResponse, next?: (err?: unknown) => void): void | Promise<void>;
}

// biome-ignore lint/suspicious/noExplicitAny: any
export type Callback = boolean | (() => any);

export const isBun = typeof Bun !== "undefined";
export const isDeno = typeof Deno !== "undefined";

export function onReady(options: { port: number; isHttps?: boolean; onReady?: Callback }) {
  return () => {
    if (import.meta.hot) {
      if (import.meta.hot.data.vikeServerStarted) {
        // @ts-expect-error conflict between bun and vite types
        import.meta.hot.send("photon:reloaded");
        return;
      }
      import.meta.hot.data.vikeServerStarted = true;
    }
    if (options?.onReady === true || options?.onReady === undefined) {
      console.log(`Server running at ${options.isHttps ? "https" : "http"}://localhost:${options.port}`);
    } else if (typeof options?.onReady === "function") {
      options.onReady();
    }
  };
}

export function nodeServe(options: ServerOptions, handler: NodeHandler): ServerType {
  options.createServer ??= nodeHTTP.createServer;
  const serverOptions = options.serverOptions ?? {};
  // biome-ignore lint/suspicious/noExplicitAny: any
  const createServer: any = options.createServer;
  const server: ServerType = createServer(serverOptions, handler);
  // onCreate hook
  options.onCreate?.(server);

  const isHttps = Boolean("cert" in serverOptions && serverOptions.cert);
  const port = getPort(options);
  if (options?.hostname) {
    server.listen(port, options.hostname, onReady({ isHttps, ...options, port }));
  } else {
    server.listen(port, onReady({ isHttps, ...options, port }));
  }

  return server;
}

export function srvxServe(options: ServeReturn) {
  const srvxOptions: SrvxServerOptions = {
    fetch: options.fetch,
  };
  const serverOptions = options.server?.options;
  const port = getPort(serverOptions);

  srvxOptions.port = port;
  if (serverOptions?.hostname) {
    srvxOptions.hostname = serverOptions.hostname;
  }
  let server: SrvxServer;
  let isHttps: boolean;
  if (isBun) {
    srvxOptions.bun = serverOptions?.bun;
    isHttps = serverOptions?.bun && "tls" in serverOptions.bun ? Boolean(serverOptions.bun) : false;
    if (isHttps) {
      srvxOptions.protocol = "https";
    }
    server = serveBun(srvxOptions);
  } else if (isDeno) {
    srvxOptions.deno = serverOptions?.deno;
    isHttps = serverOptions?.deno && "cert" in serverOptions.deno ? Boolean(serverOptions.deno.cert) : false;
    if (isHttps) {
      srvxOptions.protocol = "https";
    }
    server = serveDeno(srvxOptions);
  } else {
    isHttps = Boolean(serverOptions?.createServer) && nodeHTTP.createServer !== serverOptions?.createServer;
    srvxOptions.node = {
      ...serverOptions?.serverOptions,
      http2: nodeHTTP2.createSecureServer === serverOptions?.createServer,
    };
    if (isHttps) {
      srvxOptions.protocol = "https";
    }
    server = serveNode(srvxOptions);
  }
  serverOptions?.onCreate?.(server);
  server.ready().then(onReady({ isHttps, ...options, port }));

  return server.ready();
}

export function getPort(options?: ServerOptions) {
  return options?.port ?? 3000;
}

/**
 * server.close() does not close existing connections.
 * The returned function forces all connections to close while closing the server.
 */
function onServerClose(server: Server | Http2Server | Http2SecureServer | Promise<SrvxServer>) {
  if ("on" in server) {
    const connections: Set<Socket> = new Set();

    server.on("connection", (conn: Socket) => {
      connections.add(conn);
      conn.on("close", () => {
        connections.delete(conn);
      });
    });

    const closeAllConnections = () =>
      connections.forEach((c) => {
        c.destroy();
      });

    return function destroy(cb: () => void) {
      server.close(cb);
      closeAllConnections();
    };
  } else {
    return function destroy(cb: () => void) {
      server.then((s) => s.close(true)).then(cb);
    };
  }
}

// biome-ignore lint/suspicious/noConfusingVoidType: keep void
function _installServerHMR(server: Server | Http2Server | Http2SecureServer | Promise<SrvxServer> | void) {
  if (!server) return;
  if (import.meta.hot) {
    const destroy = onServerClose(server);

    return new Promise<void>((resolve) => {
      const callback = () => {
        destroy(() => {
          resolve();
          // Signal that the server is properly closed, so that we can continue the hot-reload process
          // @ts-expect-error conflict between bun and vite types
          import.meta.hot?.send("photon:server-closed");
        });
      };

      // biome-ignore lint/style/noNonNullAssertion: checked above
      import.meta.hot!.on("vite:beforeFullReload", callback);

      // Sent when vite server restarts
      // biome-ignore lint/style/noNonNullAssertion: checked above
      import.meta.hot!.on("photon:close-server", callback);
    });
  }
}

export function installServerHMR(
  // biome-ignore lint/suspicious/noConfusingVoidType: keep void
  serve: () => Server | Http2Server | Http2SecureServer | Promise<SrvxServer> | void,
) {
  // biome-ignore lint/style/noNonNullAssertion: asserted by wrapping function, and e2e tested
  const previousServerClosing: Promise<void> = import.meta.hot!.data.previousServerClosing ?? Promise.resolve();

  previousServerClosing.then(() => {
    const server = serve();
    // biome-ignore lint/style/noNonNullAssertion: asserted by wrapping function, and e2e tested
    import.meta.hot!.data.previousServerClosing = _installServerHMR(server);
  });
}
