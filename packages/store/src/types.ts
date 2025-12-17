export interface Store {
  entries: EntryMeta[];
}

export interface EntryMeta {
  /**
   * Module id for this entry. Can be a filesystem path, or a virtual module.
   */
  id: string;
  /**
   * If undefined, matches any HTTP method.
   */
  method?: HttpMethod | HttpMethod[];
  /**
   * Route pattern for this entry.
   *
   * Adheres to the {@link https://developer.mozilla.org/en-US/docs/Web/API/URLPattern | URLPattern API}.
   */
  pattern: URLPatternInput;
  /**
   * The Vite environment this entry belongs to.
   *
   * @default ssr
   */
  environment?: string;
}

interface URLPatternInit {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  baseURL?: string;
}

type URLPatternInput = string | URLPatternInit;

type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
