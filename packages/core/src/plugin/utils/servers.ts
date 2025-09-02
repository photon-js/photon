import type { SupportedServers } from "../../validators/types.js";

function getImports(id: string) {
  return [id, `@photonjs/${id}`, `@photonjs/core/${id}`];
}

export const serversToImports: Record<SupportedServers, string[]> = {
  hono: getImports("hono"),
  hattip: getImports("hattip"),
  elysia: getImports("elysia"),
  h3: getImports("h3"),
  express: getImports("express"),
  fastify: getImports("fastify"),
  srvx: getImports("srvx"),
};

export const importsToServer = Object.fromEntries(
  Object.entries(serversToImports).flatMap(([k, v]) => v.map((x) => [x, k])),
) as Record<string, SupportedServers>;
