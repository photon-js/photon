# @photonjs/cloudflare

Cloudflare Workers and Pages adapter for Photon, enabling deployment of universal web applications to Cloudflare's edge network.

## Overview

This adapter provides seamless integration between Photon and Cloudflare's runtime environments:
- **Cloudflare Workers**: Deploy server functions to Cloudflare's edge network
- **Cloudflare Pages**: Static site hosting with edge functions
- **Workerd Runtime**: Local development with Cloudflare's runtime
- **WebSocket Support**: Real-time applications with crossws integration
- **H3 Integration**: Built-in support for H3 server framework

## Installation

```bash
npm install @photonjs/cloudflare
# or
pnpm add @photonjs/cloudflare
# or
yarn add @photonjs/cloudflare
```

## Usage

### Basic Setup

Add the Cloudflare adapter to your Vite configuration:

```ts
// vite.config.ts
import { installPhoton } from '@photonjs/runtime/vite'
import { cloudflare } from '@photonjs/cloudflare/vite'

export default {
  plugins: [
    installPhoton({
      // optional
      server: './src/server.ts'
    }),
    cloudflare()
  ]
}
```

### Wrangler Configuration

Configure Wrangler to use your Photon's virtual entry:

```toml
# wrangler.toml
name = "my-photon-app"
main = "virtual:photon:cloudflare:server-entry"
compatibility_date = "2025-08-28"
```

### Server Integration

#### With Hono

```ts
// src/server.ts
import { Hono } from 'hono'
import { apply, serve } from '@photonjs/hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello from Photon + Hono on Cloudflare!'))

apply(app)
export default serve(app)
```

#### With H3

```ts
// src/server.ts
import { createApp, defineEventHandler } from 'h3'
import { apply, serve } from '@photonjs/h3'

const app = createApp()

app.use('/', defineEventHandler(() => 'Hello from Photon + H3 on Cloudflare!'))

apply(app)
export default serve(app)
```

## API Reference

### Exports

- `./vite` - Vite plugin for Cloudflare integration
- `./hono` - Hono-specific Cloudflare utilities
- `./h3` - H3-specific Cloudflare utilities
- `./srvx` - srvx-specific Cloudflare utilities
- `./dev` - Development server utilities
- `./virtual` - TypeScript declarations for virtual modules

### Cloudflare-specific Functions

#### `asFetch(app): ExportedHandlerFetchHandler`

Converts a Hono app to a Cloudflare Workers fetch handler:

```ts
import { asFetch } from '@photonjs/cloudflare/hono'
import { Hono } from 'hono'

const app = new Hono()
export default { fetch: asFetch(app) }
```

## Development

### Local Development with Workerd

```bash
# Development with Cloudflare's workerd runtime
npm run dev:cloudflare
# or
pnpm dev:cloudflare
```

### Building for Production

```bash
# Build for Cloudflare deployment
npm run build:cloudflare
# or
pnpm build:cloudflare
```

## Environment Variables

Access Cloudflare environment variables and bindings:

```ts
// In your handlers
export default {
  async fetch(request, env, ctx) {
    // env contains your Cloudflare bindings
    const value = env.MY_KV_NAMESPACE.get('key')
    // ...
  }
}
```

## WebSocket Support

Enable WebSocket support with crossws:

```bash
npm install crossws
```

```ts
// vite.config.ts
export default {
  plugins: [
    photon({
      server: './src/server.ts'
    }),
    cloudflare({
      // WebSocket support will be automatically detected
    })
  ]
}
```

## Examples

See the example applications:
- [Basic Cloudflare App](../../example/app-cloudflare)
- [Hono + Cloudflare App](../../example/app-hono)

## Deployment

### Using Wrangler

```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Deploy to Cloudflare Pages
wrangler pages deploy dist
```

### Using GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build:cloudflare
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## License

MIT
