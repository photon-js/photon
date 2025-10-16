# Photon

> ⚠️ **Alpha**: Photon is currently in alpha. APIs may change before stable release.

## Links

[What is Photon](https://photonjs.dev)  
[Why Photon](https://photonjs.dev/why)  

## Monorepo

### Core
- [packages/core](./packages/core) - Photon core with Vite integration
- [packages/runtime](./packages/runtime) - Convenience functions for framework developers

### Server Adapters
- [packages/hono](./packages/hono) - Hono framework adapter
- [packages/express](./packages/express) - Express.js adapter
- [packages/fastify](./packages/fastify) - Fastify adapter
- [packages/elysia](./packages/elysia) - Elysia adapter
- [packages/h3](./packages/h3) - H3 adapter
- [packages/srvx](./packages/srvx) - Srvx adapter
- [packages/hattip](./packages/hattip) - HatTip adapter

### Deployment Adapters
- [packages/adapter-cloudflare](./packages/adapter-cloudflare) - Cloudflare Workers/Pages adapter
- [packages/adapter-vercel](./packages/adapter-vercel) -Vercel adapter

## Examples
- [example/awesome-framework](./example/awesome-framework) - Example of integrating Photon into a Vite-based framework
- [example/app-cloudflare](./example/app-cloudflare) - Example app using a framework powered by Photon
- [example/app-vercel](./example/app-vercel) - Example app using a framework powered by Photon
- [example/app-hono-cloudflare](./example/app-hono-cloudflare) - Example app using Photon + Hono on Cloudflare
