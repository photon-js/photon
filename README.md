# Photon

> ⚠️ **Alpha**: Photon is currently in alpha. APIs may change before stable release.

Next-generation deployment and server toolkit.

Photon supports popular deployments such as:
 - Self-hosted
 - Cloudflare
 - Vercel

And popular servers:
 - Hono
 - Express
 - Fastify
 - etc.

It currently supports Vike. More Vite-based frameworks are coming (e.g. [we're talking with TanStack](https://github.com/SeanCassiere/cautious-giggle)).


## Documentation

- **[Getting Started](https://photonjs.dev/get-started)** - Learn how to use Photon
- **[Framework Integration](https://photonjs.dev/guide/framework-integration)** - Integrate Photon into your framework
- **[Examples](./example)** - Real-world integration examples


## Packages

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


## Philosophy

Photon is designed as an **unopinionated and flexible alternative to [Nitro](https://nitro.build/)**, specifically for framework developers who want universal server capabilities.

### Universal Server Support
- **Any server framework**: Hono, Express, Fastify, Elysia, H3, Srvx, HatTip
- **Any deployment target**: Cloudflare, Vercel, Netlify, Node.js, VPS
- **Any runtime**: Node.js, Cloudflare Workers, Deno, Bun

### Features
- **Easy integration** for Vite-based frameworks
- **Universal middlewares** that work across all server frameworks
- **Server code-splitting** for deploying each route to separate edge workers
- **Hot Module Replacement** for server code
- **TypeScript support** with first-class developer experience

### Powered by Modern Standards
- Built on **Vite's Environment API**
- Uses **Web Standard APIs** for universal compatibility
- Leverages **Universal Middleware** for framework-agnostic capabilities
