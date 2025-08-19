import type { ExportedHandlerFetchHandler } from "@cloudflare/workers-types";
import { createIncompatibleServerError, createMissingApplyError, createMissingExportError } from "../utils/errors.js";

export function asFetch(app: unknown, id: string): ExportedHandlerFetchHandler {
  if (!app) {
    throw createMissingExportError(id);
  }

  const server = (app as Record<symbol, string | undefined>)[Symbol.for("photon:server")];

  if (!server) {
    throw createMissingApplyError();
  }

  switch (server) {
    case "hono":
      return async (request, env, ctx) => {
        // @ts-expect-error
        // biome-ignore lint/suspicious/noExplicitAny: self reference
        const { asFetch } = (await import("@photonjs/cloudflare/hono")) as any;
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return asFetch(app as any)(request, env, ctx);
      };
    case "h3":
      return async (request, env, ctx) => {
        // @ts-expect-error
        // biome-ignore lint/suspicious/noExplicitAny: self reference
        const { asFetch } = (await import("@photonjs/cloudflare/h3")) as any;
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return asFetch(app as any)(request, env, ctx);
      };
  }

  throw createIncompatibleServerError(server);
}
