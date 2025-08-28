# @photonjs/h3

H3 adapter for Photon, enabling universal web applications with the minimal and modern H3 framework.

## Overview

This adapter provides seamless integration between Photon and H3:
- **Minimal and modern**: Leverage H3's clean API with Photon's universal capabilities
- **Universal compatibility**: Works across Node.js, edge runtimes, and serverless
- **Universal middleware support**: Apply Photon middlewares to H3 apps
- **Multi-runtime deployment**: Deploy to Node.js, Cloudflare, Netlify, Vercel, and more
- **Hot Module Replacement**: Full HMR support during development
- **TypeScript support**: Complete type safety with H3 and Photon

## Installation

```bash
npm install @photonjs/h3 h3
# or
pnpm add @photonjs/h3 h3
# or
yarn add @photonjs/h3 h3
```

## Usage

### Basic Setup

Create an H3 server with Photon integration:

```ts
// src/server.ts
import { createApp, defineEventHandler } from 'h3'
import { apply, serve } from '@photonjs/h3'

const app = createApp()

// Your H3 routes and middleware
app.use('/', defineEventHandler(() => {
  return 'Hello from Photon + H3!'
}))

app.use('/api/users', defineEventHandler(() => {
  return { users: ['Alice', 'Bob'] }
}))

// Apply Photon universal middlewares
apply(app)

// Start the server with Photon
export default serve(app)
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

### With H3 Utilities

Combine H3 utilities with Photon universal middlewares:

```ts
// src/server.ts
import { 
  createApp, 
  defineEventHandler, 
  readBody, 
  getQuery,
  setHeader,
  createError
} from 'h3'
import { apply, serve } from '@photonjs/h3'
import awesomeFramework from 'awesome-framework/universal-middleware'

const app = createApp()

// Global middleware
app.use(defineEventHandler(async (event) => {
  setHeader(event, 'x-powered-by', 'Photon + H3')
}))

// API routes
app.use('/api/users', defineEventHandler(async (event) => {
  if (event.node.req.method === 'GET') {
    const query = getQuery(event)
    return { users: ['Alice', 'Bob'], query }
  }
  
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    return { message: 'User created', data: body }
  }
  
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed'
  })
}))

// Health check
app.use('/api/health', defineEventHandler(() => {
  return { status: 'ok', timestamp: new Date().toISOString() }
}))

// Apply universal middlewares
apply(app, [
  awesomeFramework,
  // Additional universal middlewares...
])

export default serve(app)
```

## API Reference

### Functions

#### `apply(app, additionalMiddlewares?)`

Applies Photon universal middlewares to an H3 application.

**Parameters:**
- `app: App` - The H3 application instance
- `additionalMiddlewares?: UniversalMiddleware[]` - Optional additional middlewares

**Returns:** The same H3 app instance (for chaining)

```ts
import { apply } from '@photonjs/h3'

const app = createApp()
apply(app) // Applies configured universal middlewares
```

#### `serve(app, options?)`

Starts the H3 server with Photon integration and HMR support.

**Parameters:**
- `app: App` - The H3 application instance
- `options?: ServerOptions` - Optional server configuration

**Returns:** The H3 app instance

```ts
import { serve } from '@photonjs/h3'

const app = createApp()
serve(app, {
  port: 3000,
  hostname: 'localhost'
})
```

### Server Options

```ts
interface ServerOptions {
  port?: number
  hostname?: string
  createServer?: typeof createServer
  onCreate?: (server: Server) => void
}
```

### Exports

- `./apply` - Middleware application utilities
  - Development version: `./apply` (dev mode)
  - Production versions: `./apply` (node/edge modes)
- `./serve` - Server creation utilities
  - Node.js version: `./serve` (node runtime)
  - Universal version: `./serve` (other runtimes)

## Development

### Development Server

Start the development server with HMR:

```bash
npm run dev
# or
pnpm dev
```

The server will automatically restart when you make changes to your code.

### Building for Production

Build your application for production:

```bash
npm run build
# or
pnpm build
```

### Preview Production Build

Test your production build locally:

```bash
npm run preview
# or
pnpm preview
```

## Deployment

### Node.js Deployment

The H3 adapter works great with Node.js deployment:

```ts
// Your built server will work with standard Node.js hosting
node dist/server/index.js
```

### Serverless Deployment

H3 is perfect for serverless environments:

**Netlify Functions:**
```ts
// netlify/functions/api.ts
import { toWebHandler } from 'h3'
import app from '../src/server'

export default toWebHandler(app)
```

**Vercel Functions:**
```ts
// api/index.ts
import { toNodeListener } from 'h3'
import app from '../src/server'

export default toNodeListener(app)
```

### Cloudflare Workers

Deploy to Cloudflare Workers:

```ts
// Use with @photonjs/cloudflare adapter
import { asFetch } from '@photonjs/cloudflare/h3'
import app from './server'

export default { fetch: asFetch(app) }
```

## Advanced Usage

### Request Handling

Handle different HTTP methods and extract data:

```ts
app.use('/api/posts/:id', defineEventHandler(async (event) => {
  const method = getMethod(event)
  const id = getRouterParam(event, 'id')
  
  switch (method) {
    case 'GET':
      return await getPost(id)
    case 'PUT':
      const body = await readBody(event)
      return await updatePost(id, body)
    case 'DELETE':
      await deletePost(id)
      setResponseStatus(event, 204)
      return null
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
  }
}))
```

### Error Handling

Implement custom error handling:

```ts
app.use(defineEventHandler(async (event) => {
  try {
    // Your logic here
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { error: error.message }
    })
  }
}))

// Apply Photon middlewares after error handlers
apply(app)
```

### File Uploads

Handle file uploads with H3:

```ts
import { readMultipartFormData } from 'h3'

app.use('/api/upload', defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({ statusCode: 405 })
  }
  
  const formData = await readMultipartFormData(event)
  
  for (const item of formData || []) {
    if (item.filename) {
      // Handle file upload
      await saveFile(item.filename, item.data)
    }
  }
  
  return { message: 'Files uploaded successfully' }
}))
```

### Session Management

Integrate with session management:

```ts
import { getCookie, setCookie } from 'h3'

app.use('/api/session', defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session-id')
  
  if (!sessionId) {
    const newSessionId = generateSessionId()
    setCookie(event, 'session-id', newSessionId, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    return { sessionId: newSessionId, isNew: true }
  }
  
  return { sessionId, isNew: false }
}))
```

## Examples

See the [test applications](../../tests/app) for complete working examples.

## Troubleshooting

### Common Issues

**Port already in use:**
```ts
serve(app, { port: process.env.PORT || 3001 })
```

**Middleware order:**
Apply Photon middlewares after your H3-specific middleware for best compatibility.

**TypeScript issues:**
Make sure to import types from H3 for proper TypeScript support.

## License

MIT
