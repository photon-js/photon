# Photon

> ⚠️ **Alpha Stage**: Photon is currently in alpha. APIs may change before stable release.

Next-generation server toolkit designed for **library and framework developers** who need universal server capabilities.

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
- [packages/hattip](./packages/hattip) - HatTip adapter

### Deployment Adapters
- [packages/adapter-cloudflare](./packages/adapter-cloudflare) - Cloudflare Workers/Pages adapter

## Examples
- [example/awesome-framework](./example/awesome-framework) - Example of integrating Photon into a Vite-based framework
- [example/app-cloudflare](./example/app-cloudflare) - Example app using a framework powered by Photon
- [example/app-hono-cloudflare](./example/app-hono-cloudflare) - Example app using Photon + Hono on Cloudflare

## Philosophy

Photon is designed as an **unopinionated and flexible alternative to Nitro**, specifically for framework developers who need:

### Universal Server Support
- **Any server framework**: Hono, Express, Fastify, Elysia, H3, HatTip
- **Any deployment target**: Cloudflare, Vercel, Netlify, Node.js, VPS
- **Any runtime**: Node.js, Cloudflare Workers, Deno, Bun

### Framework Developer Focus
- **Easy integration** for Vite-based frameworks
- **Universal middleware** that works across all server frameworks
- **Server code-splitting**: Deploy each route to separate edge workers
- **Hot Module Replacement** for server code
- **TypeScript-first** with excellent developer experience

### Powered by Modern Standards
- Built on **Vite's Environment API**
- Uses **Web Standard APIs** for universal compatibility
- Leverages **Universal Middleware** for framework-agnostic capabilities

## Documentation

- **[Getting Started](https://photonjs.dev/get-started)** - Learn how to use Photon
- **[Framework Integration](https://photonjs.dev/guide/framework-integration)** - Integrate Photon into your framework
- **[Examples](./example)** - Real-world integration examples

## See also

 - [Playground trying out PhotonJS - made by TanStack team](https://github.com/SeanCassiere/cautious-giggle)
