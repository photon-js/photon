# @photonjs/core

The core package of Photon - an unopinionated and flexible alternative to Nitro that works with any server framework and any deployment target.

## Overview

Photon Core provides the foundational functionality for building universal web applications with:
- **Universal server support**: Works with Hono, Express, Fastify, Elysia, H3, Hattip, and more
- **Multi-platform deployment**: Deploy to Netlify, Vercel, Cloudflare, VPS, or any other platform
- **Vite integration**: Powered by Vite's Environment API with HMR support
- **Server code-splitting**: Each page and API route can be deployed to separate edge workers
- **TypeScript-first**: Full TypeScript support with excellent DX

## Installation

```bash
npm install @photonjs/core
# or
pnpm add @photonjs/core
# or
yarn add @photonjs/core
```

## Usage

### Vite Plugin

Add Photon to your Vite configuration:

```ts
// vite.config.ts
import { photon } from '@photonjs/core/vite'

export default {
  plugins: [
    photon({
      server: './src/server.ts',
      entries: {
        'api/users': './src/api/users.ts',
        'middleware/auth': './src/middleware/auth.ts'
      }
    })
  ]
}
```

### Configuration

The core package accepts a configuration object with the following options:

```ts
interface PhotonConfig {
  server?: string | EntryServerPartial
  entries?: Record<string, string | EntryPartial>
  // Additional configuration options...
}
```

## API Reference

### Exports

- `./vite` - Vite plugin for Photon integration
- `./api` - Core API functions for managing entries and configuration
- `./dev` - Development server utilities
- `./apply` - Universal middleware application utilities
- `./serve` - Server creation and management utilities
- `./errors` - Error classes and utilities
- `./virtual` - TypeScript declarations for virtual modules

### Key Functions

#### `photon(config?: Photon.Config): Plugin[]`

Creates the Photon Vite plugin with the specified configuration.

#### API Functions

```ts
import { api } from '@photonjs/core'

// Add a new Photon entry
api.addPhotonEntry(entry)

// Update an existing entry
api.updatePhotonEntry(id, updates)

// Get server ID with entry
api.getPhotonServerIdWithEntry(entryId)
```

### Error Classes

```ts
import {
  PhotonError,
  PhotonConfigError,
  PhotonRuntimeError,
  PhotonUsageError,
  PhotonDependencyError,
  PhotonBugError
} from '@photonjs/core'
```

## Virtual Modules

Photon provides virtual modules that are resolved at build time:

- `photon:get-middlewares:*` - Access to universal middlewares for different runtimes
- Various server-specific virtual modules for different deployment targets

## Integration with Server Frameworks

While this is the core package, you'll typically use it alongside server-specific adapters:

- `@photonjs/express` - Express.js integration
- `@photonjs/fastify` - Fastify integration
- `@photonjs/hono` - Hono integration
- `@photonjs/h3` - H3 integration
- `@photonjs/elysia` - Elysia integration
- `@photonjs/hattip` - Hattip integration

## Deployment Adapters

For deployment to specific platforms:

- `@photonjs/cloudflare` - Cloudflare Workers/Pages
- More adapters coming soon for Netlify, Vercel, etc.

## Examples

See the [examples directory](../../example) for complete working examples of Photon integration.

## License

MIT
