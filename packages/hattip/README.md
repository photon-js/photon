# @photonjs/hattip

HatTip adapter for Photon, enabling universal web applications with the lightweight and universal HatTip framework.

## Overview

This adapter provides seamless integration between Photon and HatTip:
- **Universal by design**: HatTip works across all JavaScript runtimes
- **Lightweight**: Minimal overhead with maximum compatibility
- **Universal middleware support**: Apply Photon middlewares to HatTip apps
- **Multi-runtime deployment**: Deploy to Node.js, Deno, Bun, Cloudflare, and more
- **Hot Module Replacement**: Full HMR support during development
- **Web Standards**: Built on standard Web APIs (Request/Response)

## Installation

```bash
npm install @photonjs/hattip @hattip/core
# or
pnpm add @photonjs/hattip @hattip/core
# or
yarn add @photonjs/hattip @hattip/core
```

You may also want to install runtime-specific adapters:

```bash
# For Node.js
npm install @hattip/adapter-node

# For Deno
npm install @hattip/adapter-deno

# For Bun
npm install @hattip/adapter-bun

# For Cloudflare Workers
npm install @hattip/adapter-cloudflare-workers
```

## Usage

### Basic Setup

Create a HatTip server with Photon integration:

```ts
// src/server.ts
import { createRouter } from '@hattip/router'
import { apply, serve } from '@photonjs/hattip'

const router = createRouter()

// Your HatTip routes and middleware
router.get('/', () => {
  return new Response('Hello from Photon + HatTip!')
})

router.get('/api/users', () => {
  return Response.json({ users: ['Alice', 'Bob'] })
})

// Apply Photon universal middlewares
apply(router)

// Start the server with Photon
export default serve(router)
```

### Vite Configuration

Configure Photon in your Vite config:

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

### With HatTip Middleware

Combine HatTip middleware with Photon universal middlewares:

```ts
// src/server.ts
import { createRouter } from '@hattip/router'
import { cors } from '@hattip/cors'
import { apply, serve } from '@photonjs/hattip'
import awesomeFramework from 'awesome-framework/universal-middleware'

const router = createRouter()

// HatTip middleware
router.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

// Global middleware
router.use((context) => {
  console.log(`${context.request.method} ${context.url.pathname}`)
})

// API routes
router.get('/api/users', () => {
  return Response.json({ users: ['Alice', 'Bob'] })
})

router.post('/api/users', async (context) => {
  const body = await context.request.json()
  return Response.json({ message: 'User created', data: body })
})

// Health check
router.get('/api/health', () => {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  })
})

// Apply universal middlewares
apply(router, [
  awesomeFramework,
  // Additional universal middlewares...
])

export default serve(router)
```

## API Reference

### Functions

#### `apply(app, additionalMiddlewares?)`

Applies Photon universal middlewares to a HatTip application.

**Parameters:**
- `app: RequestHandler` - The HatTip application/router instance
- `additionalMiddlewares?: UniversalMiddleware[]` - Optional additional middlewares

**Returns:** The same HatTip app instance (for chaining)

```ts
import { apply } from '@photonjs/hattip'

const router = createRouter()
apply(router) // Applies configured universal middlewares
```

#### `serve(app, options?)`

Starts the HatTip server with Photon integration and HMR support.

**Parameters:**
- `app: RequestHandler` - The HatTip application/router instance
- `options?: ServerOptionsBase` - Optional server configuration

**Returns:** The HatTip app instance

```ts
import { serve } from '@photonjs/hattip'

const router = createRouter()
serve(router, {
  port: 3000,
  hostname: 'localhost'
})
```

### Server Options

```ts
interface ServerOptionsBase {
  port?: number
  hostname?: string
  onCreate?: (server: Server) => void
}
```

### Exports

- `./apply` - Middleware application utilities
  - Development version: `./apply` (dev mode)
  - Production versions: `./apply` (node/edge modes)
- `./serve` - Server creation utilities
  - Node.js version: `./serve` (node runtime)
  - Deno version: `./serve` (deno runtime)
  - Bun version: `./serve` (bun runtime)
  - Universal version: `./serve` (other runtimes)

## Multi-Runtime Support

### Node.js

```ts
// Works out of the box with Node.js
export default serve(router)
```

### Deno

```ts
// Works seamlessly with Deno
import { serve as denoServe } from '@hattip/adapter-deno'
import router from './router'

denoServe(router, { port: 3000 })
```

### Bun

```ts
// Optimized for Bun runtime
import { serve as bunServe } from '@hattip/adapter-bun'
import router from './router'

bunServe(router, { port: 3000 })
```

### Cloudflare Workers

```ts
// Deploy to Cloudflare Workers
import { cloudflareWorkersAdapter } from '@hattip/adapter-cloudflare-workers'
import router from './router'

export default cloudflareWorkersAdapter(router)
```

## Development

### Development Server

Start the development server with HMR:

```bash
npm run dev
# or
pnpm dev
```

### Building for Production

Build your application for production:

```bash
npm run build
# or
pnpm build
```

## Deployment

### Universal Deployment

HatTip's universal design makes deployment straightforward:

**Node.js:**
```bash
node dist/server/index.js
```

**Deno:**
```bash
deno run --allow-net dist/server/index.js
```

**Bun:**
```bash
bun run dist/server/index.js
```

### Platform-specific Deployment

**Cloudflare Workers:**
```ts
// wrangler.toml
name = "my-hattip-app"
main = "dist/server/index.js"
compatibility_date = "2024-01-01"
```

**Netlify Functions:**
```ts
// netlify/functions/api.ts
import { netlifyAdapter } from '@hattip/adapter-netlify-functions'
import router from '../../src/router'

export const handler = netlifyAdapter(router)
```

**Vercel Functions:**
```ts
// api/index.ts
import { vercelAdapter } from '@hattip/adapter-vercel-edge'
import router from '../src/router'

export default vercelAdapter(router)
```

## Advanced Usage

### Request Context

Access the full request context:

```ts
router.get('/api/info', (context) => {
  const { request, url, platform } = context
  
  return Response.json({
    method: request.method,
    pathname: url.pathname,
    headers: Object.fromEntries(request.headers),
    platform: platform?.name || 'unknown'
  })
})
```

### Middleware Composition

Create reusable middleware:

```ts
const authMiddleware = (context, next) => {
  const token = context.request.headers.get('authorization')
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  context.user = verifyToken(token)
  return next()
}

const loggerMiddleware = (context, next) => {
  console.log(`${context.request.method} ${context.url.pathname}`)
  return next()
}

router.use(loggerMiddleware)
router.use('/api/protected/*', authMiddleware)
```

### Error Handling

Implement global error handling:

```ts
const errorHandler = (context, next) => {
  try {
    return next()
  } catch (error) {
    console.error('Request error:', error)
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

router.use(errorHandler)
```

### File Uploads

Handle file uploads with Web APIs:

```ts
router.post('/api/upload', async (context) => {
  const formData = await context.request.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }
  
  const buffer = await file.arrayBuffer()
  await saveFile(file.name, buffer)
  
  return Response.json({ 
    message: 'File uploaded successfully',
    filename: file.name,
    size: file.size
  })
})
```

### Streaming Responses

Create streaming responses:

```ts
router.get('/api/stream', () => {
  const stream = new ReadableStream({
    start(controller) {
      let count = 0
      const interval = setInterval(() => {
        if (count >= 10) {
          controller.close()
          clearInterval(interval)
          return
        }
        
        controller.enqueue(`data: ${count++}\n\n`)
      }, 1000)
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache'
    }
  })
})
```

## Examples

See the [test applications](../../tests/app) for complete working examples.

## Troubleshooting

### Common Issues

**Runtime compatibility:**
HatTip is designed to work across all runtimes. Use Web Standard APIs for maximum compatibility.

**Middleware order:**
Apply Photon middlewares after your HatTip-specific middleware for best compatibility.

**Platform-specific features:**
Some platform-specific features may not be available in all runtimes.

## License

MIT
