export interface Store {
  /**
   * The key represents the entry path or virtual module id.
   */
  entries: Map<string, EntryMeta>;
}

export interface EntryMeta {
  /**
   * Can be used for debugging purposes if present.
   */
  name?: string;
  /**
   * If undefined, matches any method.
   */
  method?: HttpMethod | HttpMethod[];
  /**
   * Routing information for this entry.
   * Adheres to the {@link https://developer.mozilla.org/en-US/docs/Web/API/URLPattern | URLPattern API}.
   *
   * @default /:slug*
   */
  pattern?: URLPatternInput;
  /**
   * Which Vite environment is used to build this entry.
   *
   * @default ssr
   */
  viteEnv?: string;
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
