import type { Stats } from "node:fs";
import type {
  createServer as createServerHTTP,
  IncomingMessage,
  ServerOptions as ServerOptionsHTTP,
  ServerResponse,
} from "node:http";
import type {
  createSecureServer as createServerHTTP2,
  Http2SecureServer,
  Http2Server,
  Http2ServerRequest,
  Http2ServerResponse,
  SecureServerOptions as ServerOptionsHTTP2,
} from "node:http2";
import type { createServer as createServerHTTPS, ServerOptions as ServerOptionsHTTPS } from "node:https";
import type { Plugin } from "vite";

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
  // @ts-expect-error Bun/Deno
  // biome-ignore lint/suspicious/noExplicitAny: Bun server
  onCreate?<Server extends ServerType | Deno.HttpServer | Bun.Server<any> | unknown>(server?: Server): void;
  // @ts-expect-error Bun/Deno
  bun?: Omit<Parameters<typeof Bun.serve>[0], "fetch" | "port">;
  // @ts-expect-error Bun/Deno
  deno?: Omit<Deno.ServeTcpOptions | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem), "port" | "handler">;
  sirv?: boolean | (SirvOptions & { dir?: string });
}

// Extracted from sirv
type Arrayable<T> = T | T[];
export interface SirvOptions {
  dev?: boolean;
  etag?: boolean;
  maxAge?: number;
  immutable?: boolean;
  single?: string | boolean;
  ignores?: false | Arrayable<string | RegExp>;
  extensions?: string[];
  dotfiles?: boolean;
  brotli?: boolean;
  gzip?: boolean;
  onNoMatch?: (req: IncomingMessage, res: ServerResponse) => void;
  setHeaders?: (res: ServerResponse, pathname: string, stats: Stats) => void;
}

export interface NodeHandler {
  (req: IncomingMessage, res: ServerResponse, next?: (err?: unknown) => void): void | Promise<void>;
  (req: Http2ServerRequest, res: Http2ServerResponse, next?: (err?: unknown) => void): void | Promise<void>;
}

export interface ServeReturn<App = unknown> {
  fetch: (request: Request) => Response | Promise<Response>;
  server?: {
    name: string;
    app?: App;
    nodeHandler?: NodeHandler;
    options?: ServerOptions;
  };
}

// biome-ignore lint/suspicious/noExplicitAny: any
export type Callback = boolean | (() => any);

// biome-ignore lint/suspicious/noExplicitAny: any
export type PluginContext = ThisParameterType<Extract<Plugin["resolveId"], (...args: never) => any>>;

// biome-ignore lint/suspicious/noExplicitAny: any
export type ModuleInfo = Parameters<Extract<Plugin["moduleParsed"], (...args: never) => any>>[0];

// biome-ignore lint/suspicious/noExplicitAny: any
export type LoadResult = Awaited<ReturnType<Extract<Plugin["load"], (...args: never) => any>>>;

export type ResolvedId = Awaited<ReturnType<PluginContext["resolve"]>>;
