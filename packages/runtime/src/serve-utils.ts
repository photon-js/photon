import nodeHTTP from "node:http";
import type { NodeHandler, ServerOptions, ServerType } from "@photonjs/core";

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
  const server: ServerType = createServer(serverOptions, handler);
  // onCreate hook
  options.onCreate?.(server);

  const isHttps = Boolean("cert" in serverOptions && serverOptions.cert);
  const port = getPort(options);
  const host = options?.hostname;

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

export function getPort(options?: ServerOptions) {
  return options?.port ?? (process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000);
}
