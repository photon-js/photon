import type { Fetchable } from "@photonjs/core/api/internal";
import { PhotonRuntimeError } from "@photonjs/core/errors";

export function assertServerEntry<T>(entry: T): asserts entry is T & Fetchable {
  if (!entry) {
    throw new PhotonRuntimeError("Server entry must have a default export");
  }
  if (typeof entry !== "object") {
    throw new PhotonRuntimeError("Server entry default export must be an object");
  }
  if (!("fetch" in entry)) {
    throw new PhotonRuntimeError("Server entry default export must include a 'fetch' method");
  }
}
