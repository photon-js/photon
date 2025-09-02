# @photonjs/srvx

Srvx adapter for Photon.

## Features

- Ultrafast performance with Srvx
- Edge-first design for Cloudflare Workers, Deno, Bun
- Universal middleware support
- Multi-runtime deployment
- HMR support
- Full TypeScript support

## Installation

```bash
npm install @photonjs/srvx @universal-middleware/core
```

## Getting Started

```ts
// src/server.ts
import { apply, serve } from '@photonjs/srvx'
import { enhance } from ' @universal-middleware/core'


export default serve(apply([
  enhance(
    () => new Response('/api'),
    {
      name: "my-app:api",
      path: "/api",
      method: ["GET", "POST"],
    }
  ),
  enhance(
    () => new Response('OK'),
    {
      name: "my-app:catch-all",
      path: "/**",
      method: "GET",
    }
  )
]))
```

```ts
// vite.config.ts
import { photon } from '@photonjs/core/vite'

export default {
  plugins: [
    photon({
      server: './src/server.ts'
    })
  ]
}
```

## API

### `apply(middlewares?)`

Pipes Photon middlewares and returns a srvx request handler.

```ts
const app = apply() // Apply configured middlewares
const app = apply([customMiddleware]) // Apply additional middlewares
```

### `serve(app, options?)`

Start the server with HMR support.

```ts
serve(app, { port: 3000 })
```

## Deployment

Srvx works across all JavaScript runtimes:

- **Node.js** - `node dist/server/index.js`
- **Cloudflare Workers** - Deploy with Wrangler
- **Deno** - `deno run dist/server/index.js`
- **Bun** - `bun run dist/server/index.js`

## Commands

```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
```
