import nodeHTTP from "node:http";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { NodeHandler, ServerOptions, ServerType } from "@photonjs/core";
import sirv from "sirv";

// biome-ignore lint/suspicious/noExplicitAny: any
export type OnReady = boolean | ((url: string | undefined) => any);

export const isBun = typeof Bun !== "undefined";
export const isDeno = typeof Deno !== "undefined";

export function onReady(options: { url(): string | undefined; onReady?: OnReady }) {
  return () => {
    const url = options.url();
    if (url && (options.onReady === true || options?.onReady === undefined)) {
      console.log(`Server running at ${url}`);
    } else if (typeof options?.onReady === "function") {
      options.onReady(url);
    }
  };
}

export function nodeServe(options: ServerOptions, handler: NodeHandler): ServerType {
  options.createServer ??= nodeHTTP.createServer;
  const serverOptions = options.serverOptions ?? {};
  // biome-ignore lint/suspicious/noExplicitAny: any
  const createServer: any = options.createServer;

  const finalHandler =
    options.sirv === false || options.sirv === null
      ? handler
      : options.sirv === true || options.sirv === undefined
        ? combine(sirv(getDefaultStaticDir(), { etag: true }) as NodeHandler, handler)
        : combine(
            sirv(options.sirv.dir ?? getDefaultStaticDir(), { etag: true, ...options.sirv }) as NodeHandler,
            handler,
          );

  const server: ServerType = createServer(serverOptions, finalHandler);
  // onCreate hook
  options.onCreate?.(server);

  const isHttps = Boolean("cert" in serverOptions && serverOptions.cert);
  const port = getPort(options);
  const host = getHostname(options);

  function url() {
    const addr = server.address();
    if (!addr) {
      return undefined;
    }

    if (typeof addr === "string") {
      return addr;
    }

    let host = addr.address;
    if (!host || !addr.port) {
      return undefined;
    }
    if (host === "::") {
      host = "localhost";
    } else if (host.includes(":")) {
      host = `[${host}]`;
    }
    return `http${isHttps ? "s" : ""}://${host}:${addr.port}/`;
  }

  if (host) {
    server.listen(
      port,
      host,
      onReady({
        ...options,
        url,
      }),
    );
  } else {
    server.listen(
      port,
      onReady({
        ...options,
        url,
      }),
    );
  }

  return server;
}

function getDefaultStaticDir() {
  const argv1 = process.argv[1];
  const entrypointDirAbs = argv1
    ? dirname(isAbsolute(argv1) ? argv1 : join(process.cwd(), argv1))
    : dirname(fileURLToPath(import.meta.url));
  return join(entrypointDirAbs, "..", "client");
}

export function getPort(options?: ServerOptions) {
  return options?.port ?? (process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000);
}

export function getHostname(options?: ServerOptions) {
  return options?.hostname ?? process.env.PHOTON_HOSTNAME;
}

export function combine(h1: NodeHandler, h2: NodeHandler): NodeHandler {
  return function combined(req, res, next) {
    function runSecond(): void {
      // biome-ignore lint/suspicious/noExplicitAny: cast
      h2(req as any, res as any, next);
    }

    // biome-ignore lint/suspicious/noExplicitAny: cast
    const maybe = h1(req as any, res as any, runSecond);

    if (maybe instanceof Promise) {
      maybe.catch((err) => {
        throw err;
      });
    }
  };
}
