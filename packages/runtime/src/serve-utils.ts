import nodeHTTP from "node:http";
import nodeHTTP2 from "node:http2";
import type { Socket } from "node:net";
import { PhotonBugError } from "@photonjs/core/errors";
import type { NodeHandler, ServeReturn, ServerOptions, ServerType } from "@photonjs/core/serve";
import type { Server as SrvxServer, ServerOptions as SrvxServerOptions } from "srvx";
import { serve as serveSrvx } from "srvx";

// biome-ignore lint/suspicious/noExplicitAny: type
export type Servers = ServerType | SrvxServer | Bun.Server<any> | Deno.HttpServer;

// biome-ignore lint/suspicious/noExplicitAny: any
export type Callback = boolean | (() => any);

export const isBun = typeof Bun !== "undefined";
export const isDeno = typeof Deno !== "undefined";

const controllerMap = new WeakMap<AbortSignal, AbortController>();

export function onReady(options: { port: number; host: string | undefined; isHttps?: boolean; onReady?: Callback }) {
  return () => {
    if (import.meta.hot) {
      if (import.meta.hot.data.photonServerStarted) {
        // @ts-expect-error conflict between bun and vite types
        import.meta.hot.send("photon:reloaded");
        return;
      }
      import.meta.hot.data.photonServerStarted = true;
    }
    if (options?.onReady === true || options?.onReady === undefined) {
      console.log(
        `Server running at ${options.isHttps ? "https" : "http"}://${options?.host || "localhost"}:${options.port}`,
      );
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
  const host = getHostname(options);
  if (host) {
    server.listen(port, host, onReady({ isHttps, ...options, port, host }));
  } else {
    server.listen(port, onReady({ isHttps, ...options, port, host }));
  }

  return server;
}

export function srvxServe(options: ServeReturn) {
  const srvxOptions: SrvxServerOptions = {
    fetch: options.fetch,
    gracefulShutdown: false,
  };
  const serverOptions = options.server?.options;
  const port = getPort(serverOptions);
  const host = getHostname(serverOptions);

  srvxOptions.port = port;
  if (host) {
    srvxOptions.hostname = host;
  }
  let isHttps: boolean;
  if (isBun) {
    srvxOptions.bun = serverOptions?.bun;
    isHttps = serverOptions?.bun && "tls" in serverOptions.bun ? Boolean(serverOptions.bun) : false;
  } else if (isDeno) {
    const controller = new AbortController();

    if (serverOptions?.deno?.signal) {
      // Forward abort signal if specified by user
      serverOptions.deno.signal.addEventListener("abort", () => {
        controller.abort();
      });
    }

    srvxOptions.deno = {
      ...serverOptions?.deno,
      signal: controller.signal,
      // biome-ignore lint/suspicious/noExplicitAny: cast
    } as any;
    controllerMap.set(controller.signal, controller);
    isHttps = serverOptions?.deno && "cert" in serverOptions.deno ? Boolean(serverOptions.deno.cert) : false;
  } else {
    isHttps = Boolean(serverOptions?.createServer) && nodeHTTP.createServer !== serverOptions?.createServer;
    srvxOptions.node = {
      ...serverOptions?.serverOptions,
      http2: nodeHTTP2.createSecureServer === serverOptions?.createServer,
    };
  }
  if (isHttps) {
    srvxOptions.protocol = "https";
  }
  // Rely on srvx "exports" conditions to load only the necessary runtime.
  // For instance, `srvx/node` overrides the global Request, which we want to avoid when running with Bun.
  const server = serveSrvx(srvxOptions);
  serverOptions?.onCreate?.(server);
  server.ready().then(onReady({ isHttps, onReady: serverOptions?.onReady, port, host }));

  return server.ready();
}

export function getPort(options?: ServerOptions) {
  return options?.port ?? (process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000);
}

export function getHostname(options?: ServerOptions) {
  return options?.hostname ?? process.env.HOSTNAME;
}

/**
 * server.close() does not close existing connections.
 * The returned function forces all connections to close while closing the server.
 */
async function onServerClose(serverP: Servers | Promise<Servers>) {
  let server = await serverP;
  let denoAbortController: AbortController | undefined;

  if (!("shutdown" in server) && !("stop" in server) && !("on" in server)) {
    // srvx close(true) uses closeAllConnections which does not always properly close websocket connections
    // srvx
    if (server.node?.server) {
      server = server.node.server;
    } else if (server.bun?.server) {
      server = server.bun.server;
    } else if (server.deno?.server) {
      if (server.options.deno?.signal) {
        denoAbortController = controllerMap.get(server.options.deno.signal);
      }
      server = server.deno.server;
    }
  }

  if ("shutdown" in server) {
    // Deno
    if (denoAbortController) {
      return function destroy(cb: () => void) {
        denoAbortController?.abort("hmr");
        (server as Deno.HttpServer).finished.finally(cb);
      };
    }

    throw new PhotonBugError(
      "server-side HMR is not supported for Deno. You can disable it by settings `photon.hmr = 'prefer-restart'`",
    );
  } else if ("stop" in server) {
    // Bun
    return function destroy(cb: () => void) {
      (server as Bun.Server<unknown>).stop(true).finally(cb);
    };
  }

  if (!("on" in server)) {
    throw new PhotonBugError(
      "server-side HMR is not supported for this server. You can disable it by settings `photon.hmr = 'prefer-restart'`",
    );
  }

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
}

// biome-ignore lint/suspicious/noConfusingVoidType: keep void
function _installServerHMR(server: Servers | Promise<Servers> | void) {
  if (!server) return;
  if (import.meta.hot) {
    const destroyP = onServerClose(server);

    return new Promise<void>((resolve) => {
      const callback = () => {
        destroyP.then((destroy) => {
          destroy(() => {
            resolve();
            // Signal that the server is properly closed, so that we can continue the hot-reload process
            // @ts-expect-error conflict between bun and vite types
            import.meta.hot?.send("photon:server-closed");
          });
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
  serve: () => Servers | Promise<Servers> | void,
) {
  // biome-ignore lint/style/noNonNullAssertion: asserted by wrapping function, and e2e tested
  const previousServerClosing: Promise<void> = import.meta.hot!.data.previousServerClosing ?? Promise.resolve();

  previousServerClosing.then(() => {
    const server = serve();
    // biome-ignore lint/style/noNonNullAssertion: asserted by wrapping function, and e2e tested
    import.meta.hot!.data.previousServerClosing = _installServerHMR(server);
  });
}
