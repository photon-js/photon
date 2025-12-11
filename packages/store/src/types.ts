export interface Store {
  entries: EntryMeta[];
}

export interface EntryMeta {
  /**
   * Module id for this entry. Can be a filesystem path, or a virtual module.
   */
  id: string;
  /**
   * Can be used for debugging purposes if present.
   */
  name?: string;
  /**
   * If undefined, matches any method.
   */
  method?: HttpMethod | HttpMethod[];
  /**
   * If undefined, acts as catch-all or fallback depending on the {@link isolated} property.
   *
   * Adheres to the {@link https://developer.mozilla.org/en-US/docs/Web/API/URLPattern | URLPattern API}.
   */
  pattern?: URLPatternInput;
  /**
   * This property only matters when `pattern` is undefined.
   * If true, this entry is isolated and does not include runtime routing information (fallback).
   * Used for code-split entries.
   *
   * If false or undefined, this entry contains all routing information (catch-all).
   *
   * In order of importance, a framework can declare:
   * - A catch-all entry (works everywhere, mandatory)
   * - Entries with `pattern` (Edge support, ISR, code-splitting, etc.)
   * - A fallback entry (handles unmatched requests; may replace catch-all when
   *   supported by the deployment platform)
   *
   * @default false
   */
  isolated?: boolean;
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
