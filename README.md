# Photon

> [!WARNING]
> **Beta**: Photon is currently in beta. Some details may change before stable release.

## Links

[What is Photon](https://photonjs.dev)  
[Docs](https://vike.dev/vike-photon)  
[Why Photon](https://photonjs.dev/why)  

## Monorepo

### Core
- [packages/core](./packages/core) - Photon core with Vite integration
- [packages/runtime](./packages/runtime) - Convenience functions for framework developers
- [packages/store](./packages/store) - Internal store and routing utilities

### Server Adapters
- [packages/hono](./packages/hono) - Hono framework adapter
- [packages/express](./packages/express) - Express.js adapter
- [packages/fastify](./packages/fastify) - Fastify adapter
- [packages/elysia](./packages/elysia) - Elysia adapter
- [packages/h3](./packages/h3) - H3 adapter
- [packages/srvx](./packages/srvx) - Srvx adapter
- [packages/hattip](./packages/hattip) - Hattip adapter
- [packages/node](./packages/node) - Node (HTTP) adapter

### Deployment Adapters
- [packages/adapter-cloudflare](./packages/adapter-cloudflare) - Cloudflare Workers/Pages adapter
- [packages/adapter-vercel](./packages/adapter-vercel) - Vercel adapter
- [packages/adapter-netlify](./packages/adapter-netlify) - Netlify adapter

## Examples
- [example/awesome-framework](./example/awesome-framework) - Example of integrating Photon into a Vite-based framework
- [example/app-cloudflare](./example/app-cloudflare) - Example Cloudflare app powered by Photon
- [example/app-hono](./example/app-hono) - Example app using Photon + Hono (Cloudflare Workers)
- [example/app-vercel](./example/app-vercel) - Example Vercel app powered by Photon
- [example/app-netlify](./example/app-netlify) - Example Netlify app powered by Photon
- [example/app-node](./example/app-node) - Example Node (HTTP) app powered by Photon
- [example/tanstack-start](./example/tanstack-start) - Example TanStack Start app powered by Photon
