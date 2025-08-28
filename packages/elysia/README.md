# @photonjs/elysia

Elysia adapter for Photon, enabling universal web applications with the high-performance Elysia framework optimized for Bun.

## Overview

This adapter provides seamless integration between Photon and Elysia:
- **Bun-optimized**: Leverage Elysia's performance with Bun runtime
- **Type safety**: End-to-end type safety with Elysia's TypeScript-first approach
- **Universal middleware support**: Apply Photon middlewares to Elysia apps
- **Multi-runtime deployment**: Deploy to Bun, Node.js, edge runtimes, and more
- **Hot Module Replacement**: Full HMR support during development
- **Schema validation**: Built-in request/response validation with TypeBox

## Installation

```bash
npm install @photonjs/elysia elysia
# or
pnpm add @photonjs/elysia elysia
# or
yarn add @photonjs/elysia elysia
```

For optimal performance, use with Bun:

```bash
bun add @photonjs/elysia elysia
```

## Usage

### Basic Setup

Create an Elysia server with Photon integration:

```ts
// src/server.ts
import { Elysia } from 'elysia'
import { apply, serve } from '@photonjs/elysia'

const app = new Elysia()

// Your Elysia routes and middleware
app.get('/', () => 'Hello from Photon + Elysia!')

app.get('/api/users', () => ({ users: ['Alice', 'Bob'] }))

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

### With Elysia Plugins and Validation

Combine Elysia plugins with Photon universal middlewares:

```ts
// src/server.ts
import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { apply, serve } from '@photonjs/elysia'
import awesomeFramework from 'awesome-framework/universal-middleware'

const app = new Elysia()

// Elysia plugins
app.use(cors())
app.use(swagger())

// Routes with validation
app.get('/api/users', () => ({ users: ['Alice', 'Bob'] }))

app.post('/api/users', ({ body }) => {
  return { message: 'User created', data: body }
}, {
  body: t.Object({
    name: t.String(),
    email: t.String({ format: 'email' })
  }),
  response: t.Object({
    message: t.String(),
    data: t.Object({
      name: t.String(),
      email: t.String()
    })
  })
})

// Health check
app.get('/api/health', () => ({
  status: 'ok',
  timestamp: new Date().toISOString()
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

Applies Photon universal middlewares to an Elysia application.

**Parameters:**
- `app: Elysia` - The Elysia application instance
- `additionalMiddlewares?: UniversalMiddleware[]` - Optional additional middlewares

**Returns:** The same Elysia app instance (for chaining)

```ts
import { apply } from '@photonjs/elysia'

const app = new Elysia()
apply(app) // Applies configured universal middlewares
```

#### `serve(app, options?)`

Starts the Elysia server with Photon integration and HMR support.

**Parameters:**
- `app: Elysia` - The Elysia application instance
- `options?: ServerOptionsBase` - Optional server configuration

**Returns:** The Elysia app instance

```ts
import { serve } from '@photonjs/elysia'

const app = new Elysia()
serve(app, {
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

## Development

### Development Server

Start the development server with HMR:

```bash
npm run dev
# or
pnpm dev
# or (with Bun for optimal performance)
bun run dev
```

### Building for Production

Build your application for production:

```bash
npm run build
# or
pnpm build
# or
bun run build
```

## Deployment

### Bun Deployment

Elysia is optimized for Bun runtime:

```bash
# Run directly with Bun
bun run dist/server/index.js
```

### Node.js Deployment

Also works with Node.js:

```bash
# Standard Node.js deployment
node dist/server/index.js
```

### Docker with Bun

```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package*.json bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY dist ./dist
EXPOSE 3000
CMD ["bun", "run", "dist/server/index.js"]
```

### Edge Runtime Deployment

Deploy to edge runtimes that support Elysia:

```ts
// Works with compatible edge runtimes
export default serve(app)
```

## Advanced Usage

### Type-Safe API Development

Leverage Elysia's end-to-end type safety:

```ts
import { Elysia, t } from 'elysia'

const userSchema = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String({ format: 'email' }),
  age: t.Number({ minimum: 0 })
})

const app = new Elysia()
  .model({
    user: userSchema,
    users: t.Array(userSchema)
  })
  .get('/api/users', () => users, {
    response: 'users'
  })
  .post('/api/users', ({ body }) => {
    const newUser = createUser(body)
    return newUser
  }, {
    body: t.Omit(userSchema, ['id']),
    response: userSchema
  })
```

### Custom Context and State

Extend Elysia with custom context:

```ts
const app = new Elysia()
  .state({
    version: '1.0.0',
    build: Date.now()
  })
  .decorate({
    getUser: (id: string) => database.user.findById(id),
    logger: console
  })
  .get('/api/info', ({ store, getUser, logger }) => {
    logger.info('Info endpoint called')
    return {
      version: store.version,
      build: store.build,
      timestamp: new Date().toISOString()
    }
  })
```

### Lifecycle Hooks

Use Elysia's lifecycle hooks:

```ts
const app = new Elysia()
  .onStart(() => {
    console.log('🦊 Elysia server starting...')
  })
  .onRequest(({ request }) => {
    console.log(`📨 ${request.method} ${request.url}`)
  })
  .onResponse(({ response }) => {
    console.log(`📤 Response: ${response.status}`)
  })
  .onError(({ error, code }) => {
    console.error(`❌ Error ${code}:`, error.message)
    return { error: 'Something went wrong' }
  })
```

### Plugin Development

Create reusable Elysia plugins:

```ts
const authPlugin = new Elysia({ name: 'auth' })
  .derive(({ headers }) => ({
    user: parseAuthHeader(headers.authorization)
  }))
  .guard({
    beforeHandle: ({ user }) => {
      if (!user) {
        throw new Error('Unauthorized')
      }
    }
  })

app.use(authPlugin)
  .get('/api/profile', ({ user }) => user)
```

### WebSocket Support

Add real-time capabilities:

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
  .ws('/ws', {
    message(ws, message) {
      ws.send(`Echo: ${message}`)
    },
    open(ws) {
      console.log('WebSocket connected')
    },
    close(ws) {
      console.log('WebSocket disconnected')
    }
  })
```

## Examples

See the [test applications](../../tests/app) for complete working examples.

## Troubleshooting

### Common Issues

**Bun compatibility:**
For best performance, use Bun runtime. Some Node.js-specific features may not work in Bun.

**Type errors:**
Ensure you're using compatible TypeScript versions and that all schemas are properly defined.

**Middleware order:**
Apply Photon middlewares after your Elysia-specific plugins for best compatibility.

## License

MIT
