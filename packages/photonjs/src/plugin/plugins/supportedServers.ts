import type { Plugin } from 'vite'
import type { SupportedServers } from '../../validators/types.js'

export { supportedTargetServers }

function getImports(id: string) {
  return [id, `@photonjs/${id}`, `@photonjs/core/${id}`]
}

const serversToIds: Record<SupportedServers, string[]> = {
  hono: getImports('hono'),
  hattip: getImports('hattip'),
  elysia: getImports('elysia'),
  h3: getImports('h3'),
  express: getImports('express'),
  fastify: getImports('fastify'),
}

const idsToServers = Object.fromEntries(
  Object.entries(serversToIds).flatMap(([k, v]) => v.map((x) => [x, k])),
) as Record<string, SupportedServers>

function supportedTargetServers(name: string, servers: SupportedServers[], recommend = 'hono'): Plugin {
  const serversSet = new Set(servers)

  return {
    name: `photon:unsupported-servers:${name}`,
    enforce: 'pre',

    resolveId(id) {
      if (idsToServers[id] && !serversSet.has(idsToServers[id])) {
        this.error(
          `[photon][${name}] \`${idsToServers[id]}\` is not supported while targetting \`${name}\`. We recommend using \`${recommend}\` instead.`,
        )
      }
    },
  }
}
