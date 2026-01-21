export function assertServerEntry<T>(
  entry: T,
): asserts entry is T & { fetch: (request: Request) => Response | Promise<Response> } {
  if (!entry) {
    throw new Error("Server entry must have a default export");
  }
  if (typeof entry !== "object") {
    throw new Error("Server entry default export must be an object");
  }
  if (!("fetch" in entry)) {
    throw new Error("Server entry default export must include a 'fetch' method");
  }
}
