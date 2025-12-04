# @photonjs/hono

Hono adapter for Photon.

## Features

- Ultrafast performance with Hono
- Edge-first design for Cloudflare Workers, Deno, Bun
- Universal middleware support
- Multi-runtime deployment
- HMR support
- Full TypeScript support

## Installation

```bash
npm install @photonjs/hono hono
```

## Getting Started

```ts
// src/server.ts
import { Hono } from 'hono'
import { apply, serve } from '@photonjs/hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))
app.get('/api/users', (c) => c.json({ users: ['Alice', 'Bob'] }))

apply(app)
export default serve(app)
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

## With Middleware

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { apply, serve } from '@photonjs/hono'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.get('/', (c) => c.json({ message: 'Hello!' }))
app.get('/api/health', (c) => c.json({ status: 'ok' }))

apply(app)
export default serve(app)
```

## API

### `apply(app, middlewares?)`

Apply Photon middlewares to a Hono app.

```ts
apply(app) // Apply configured middlewares
apply(app, [customMiddleware]) // Apply additional middlewares
```

### `serve(app, options?)`

Start the server with HMR support.

```ts
serve(app, { port: 3000 })
```

## Deployment

Hono works across all JavaScript runtimes:

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

## Examples

```ts
// Custom context
type Env = {
  Variables: { user: { id: string } }
}

const app = new Hono<Env>()
app.use('*', async (c, next) => {
  c.set('user', { id: '1' })
  await next()
})
```

```ts
// Error handling
app.onError((err, c) => {
  console.error(err)
  return c.text('Error', 500)
})
```

See [examples](../../example/app-hono) for more.
