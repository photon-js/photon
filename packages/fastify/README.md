# @photonjs/fastify

Fastify adapter for Photon, enabling universal web applications with the high-performance Fastify framework.

## Overview

This adapter provides seamless integration between Photon and Fastify:
- **High performance**: Leverage Fastify's speed with Photon's universal capabilities
- **Universal middleware support**: Apply Photon middlewares to Fastify apps
- **Multi-runtime deployment**: Deploy to Node.js, edge runtimes, and more
- **Hot Module Replacement**: Full HMR support during development
- **TypeScript support**: Complete type safety with Fastify and Photon
- **Plugin ecosystem**: Compatible with Fastify's rich plugin ecosystem

## Installation

```bash
npm install @photonjs/fastify fastify
# or
pnpm add @photonjs/fastify fastify
# or
yarn add @photonjs/fastify fastify
```

## Usage

### Basic Setup

Create a Fastify server with Photon integration:

```ts
// src/server.ts
import Fastify from 'fastify'
import { apply, serve } from '@photonjs/fastify'

const app = Fastify({
  logger: true
})

// Your Fastify routes and plugins
app.get('/', async (request, reply) => {
  return { message: 'Hello from Photon + Fastify!' }
})

app.get('/api/users', async (request, reply) => {
  return { users: ['Alice', 'Bob'] }
})

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

### With Fastify Plugins

Combine Fastify plugins with Photon universal middlewares:

```ts
// src/server.ts
import Fastify from 'fastify'
import { apply, serve } from '@photonjs/fastify'
import awesomeFramework from 'awesome-framework/universal-middleware'

const app = Fastify({
  logger: process.env.NODE_ENV !== 'production'
})

// Register Fastify plugins
await app.register(import('@fastify/cors'), {
  origin: true
})

await app.register(import('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/'
})

// Your routes
app.get('/', async (request, reply) => {
  return { message: 'Welcome to my app!' }
})

app.get('/api/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

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

Applies Photon universal middlewares to a Fastify application.

**Parameters:**
- `app: FastifyInstance` - The Fastify application instance
- `additionalMiddlewares?: UniversalMiddleware[]` - Optional additional middlewares

**Returns:** The same Fastify app instance (for chaining)

```ts
import { apply } from '@photonjs/fastify'

const app = Fastify()
apply(app) // Applies configured universal middlewares
```

#### `serve(app, options?)`

Starts the Fastify server with Photon integration and HMR support.

**Parameters:**
- `app: FastifyInstance` - The Fastify application instance
- `options?: ServerOptionsBase` - Optional server configuration

**Returns:** The Fastify app instance

```ts
import { serve } from '@photonjs/fastify'

const app = Fastify()
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
  - Production version: `./apply` (production mode)
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

The Fastify adapter is optimized for Node.js deployment:

```ts
// Your built server will work with standard Node.js hosting
node dist/server/index.js
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server/index.js"]
```

### Platform-specific Deployment

The adapter works with various Node.js hosting platforms:
- **Railway**: Direct deployment with automatic port detection
- **Render**: Compatible with their Node.js runtime
- **DigitalOcean App Platform**: Works with their Node.js buildpack
- **AWS Lambda**: Use with serverless Fastify adapters
- **Google Cloud Run**: Deploy as containerized Node.js app

## Advanced Usage

### Custom Fastify Options

Configure Fastify with custom options:

```ts
import Fastify from 'fastify'
import { serve } from '@photonjs/fastify'

const app = Fastify({
  logger: {
    level: 'info',
    prettyPrint: process.env.NODE_ENV !== 'production'
  },
  trustProxy: true,
  bodyLimit: 1048576 // 1MB
})

serve(app, {
  onCreate: (server) => {
    console.log('Fastify server created:', server.address())
  }
})
```

### Error Handling

Implement custom error handling:

```ts
app.setErrorHandler(async (error, request, reply) => {
  request.log.error(error)
  
  if (error.statusCode >= 500) {
    reply.status(500).send({ error: 'Internal Server Error' })
  } else {
    reply.status(error.statusCode || 400).send({ error: error.message })
  }
})

// Apply Photon middlewares after error handlers
apply(app)
```

### Schema Validation

Use Fastify's built-in schema validation:

```ts
const userSchema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' }
  }
}

app.post('/api/users', {
  schema: {
    body: userSchema,
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  // request.body is automatically validated
  const user = await createUser(request.body)
  reply.status(201).send(user)
})
```

## Examples

See the [test applications](../../tests/app) for complete working examples.

## Troubleshooting

### Common Issues

**Port already in use:**
```ts
serve(app, { port: process.env.PORT || 3001 })
```

**Plugin registration order:**
Register Fastify plugins before applying Photon middlewares for best compatibility.

## License

MIT
