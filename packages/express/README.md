# @photonjs/express

Express.js adapter for Photon, enabling universal web applications with the Express.js framework.

## Overview

This adapter provides seamless integration between Photon and Express.js:
- **Universal middleware support**: Apply Photon middlewares to Express apps
- **Multi-runtime deployment**: Deploy to Node.js, edge runtimes, and more
- **Hot Module Replacement**: Full HMR support during development
- **TypeScript support**: Complete type safety with Express and Photon
- **Production ready**: Optimized for production deployments

## Installation

```bash
npm install @photonjs/express express
# or
pnpm add @photonjs/express express
# or
yarn add @photonjs/express express
```

You'll also need the Express types for TypeScript:

```bash
npm install -D @types/express
```

## Usage

### Basic Setup

Create an Express server with Photon integration:

```ts
// src/server.ts
import express from 'express'
import { apply, serve } from '@photonjs/express'

const app = express()

// Your Express routes and middleware
app.get('/', (req, res) => {
  res.send('Hello from Photon + Express!')
})

app.get('/api/users', (req, res) => {
  res.json({ users: ['Alice', 'Bob'] })
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

### With Universal Middlewares

Apply framework-specific middlewares alongside Express middleware:

```ts
// src/server.ts
import express from 'express'
import { apply, serve } from '@photonjs/express'
import awesomeFramework from 'awesome-framework/universal-middleware'

const app = express()

// Express-specific middleware
app.use(express.json())
app.use(express.static('public'))

// Your routes
app.get('/', (req, res) => {
  res.render('index', { title: 'My App' })
})

// Apply universal middlewares (includes framework middlewares)
apply(app, [
  awesomeFramework,
  // Additional universal middlewares...
])

export default serve(app)
```

## API Reference

### Functions

#### `apply(app, additionalMiddlewares?)`

Applies Photon universal middlewares to an Express application.

**Parameters:**
- `app: Express` - The Express application instance
- `additionalMiddlewares?: UniversalMiddleware[]` - Optional additional middlewares

**Returns:** The same Express app instance (for chaining)

```ts
import { apply } from '@photonjs/express'

const app = express()
apply(app) // Applies configured universal middlewares
```

#### `serve(app, options?)`

Starts the Express server with Photon integration and HMR support.

**Parameters:**
- `app: Express` - The Express application instance
- `options?: ServerOptions` - Optional server configuration

**Returns:** The Express app instance

```ts
import { serve } from '@photonjs/express'

const app = express()
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

The Express adapter is optimized for Node.js deployment:

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
- **AWS Lambda**: Use with serverless Express adapters
- **Google Cloud Run**: Deploy as containerized Node.js app

## Advanced Usage

### Custom Server Creation

You can customize the HTTP server creation:

```ts
import { createServer } from 'node:http'
import { serve } from '@photonjs/express'

const app = express()

serve(app, {
  createServer: createServer,
  onCreate: (server) => {
    console.log('Server created:', server.address())
  }
})
```

### Middleware Ordering

Control the order of middleware application:

```ts
// Express middleware first
app.use(express.json())
app.use('/static', express.static('public'))

// Your routes
app.get('/api/*', apiRoutes)

// Apply Photon middlewares last
apply(app)
```

## Examples

See the [test applications](../../tests/app) for complete working examples.

## Troubleshooting

### Common Issues

**Port already in use:**
```ts
serve(app, { port: process.env.PORT || 3001 })
```

**Middleware order issues:**
Apply Photon middlewares after your Express-specific middleware but before error handlers.

## License

MIT
