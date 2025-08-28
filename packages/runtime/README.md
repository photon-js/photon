# @photonjs/runtime

A convenience package that provides Photon with automatic fallback functionality for quick prototyping and development.

## Overview

The runtime package is designed to make getting started with Photon as simple as possible by:
- **Automatic fallback**: Provides a default Hono server when no server entry is specified
- **Zero configuration**: Works out of the box without any setup
- **Development friendly**: Perfect for prototyping and quick experiments
- **Production ready**: Can be used in production with proper configuration

## Installation

```bash
npm install @photonjs/runtime
# or
pnpm add @photonjs/runtime
# or
yarn add @photonjs/runtime
```

## Usage

### Quick Start

The simplest way to get started with Photon:

```ts
// vite.config.ts
import { photon } from '@photonjs/runtime/vite'

export default {
  plugins: [
    photon()
  ]
}
```

That's it! The runtime package will automatically:
1. Create a fallback Hono server if no server entry is provided
2. Apply any universal middlewares you've defined
3. Set up the development server with HMR

### Fallback Server

When no server entry is specified, the runtime package creates a default server equivalent to:

```ts
// Automatically generated fallback
import { apply, serve } from '@photonjs/hono'
import { Hono } from 'hono'

function startServer() {
  const app = new Hono()
  apply(app) // Applies your universal middlewares
  return serve(app)
}

export default startServer()
```

### With Custom Configuration

You can still provide custom configuration while using the runtime package:

```ts
// vite.config.ts
import { photon } from '@photonjs/runtime/vite'

export default {
  plugins: [
    photon({
      entries: {
        'api/users': './src/api/users.ts',
        'middleware/auth': './src/middleware/auth.ts'
      }
    })
  ]
}
```

### Overriding the Fallback

If you want to use your own server entry, simply specify it:

```ts
// vite.config.ts
import { photon } from '@photonjs/runtime/vite'

export default {
  plugins: [
    photon({
      server: './src/my-server.ts' // This overrides the fallback
    })
  ]
}
```

## When to Use

### ✅ Good for:
- **Prototyping**: Quick experiments and proof of concepts
- **Learning**: Getting familiar with Photon without setup complexity
- **Simple applications**: Apps that don't need custom server logic
- **Universal middleware only**: When you only need to add middlewares

### ⚠️ Consider alternatives for:
- **Complex server logic**: Use specific server adapters like `@photonjs/express`
- **Production applications**: Consider explicit server configuration
- **Performance critical**: Direct server adapters may have less overhead
- **Non-Hono preferences**: If you prefer Express, Fastify, etc.

## API Reference

### Exports

- `./vite` - Vite plugin with fallback functionality
- `./virtual` - TypeScript declarations for virtual modules

### Functions

#### `photon(config?: Photon.Config): Plugin[]`

Creates Photon plugins with automatic fallback server generation.

#### `installPhoton(...args): Plugin[]`

Alternative installation method that includes the fallback functionality.

## Virtual Modules

The runtime package provides access to:

- `photon:fallback-entry` - The automatically generated fallback server
- `photon:get-middlewares:*` - Universal middleware resolution
- `photon:resolve-from-photon:*` - Dependency resolution helpers

## Dependencies

The runtime package includes:
- `@photonjs/core` - Core Photon functionality
- `@photonjs/hono` - Hono server adapter for the fallback
- `hono` - The Hono web framework

## Migration

### From Runtime to Specific Adapter

When you're ready to move from the runtime package to a specific server adapter:

1. Install the desired adapter:
```bash
npm install @photonjs/express
```

2. Update your Vite config:
```ts
// Before
import { photon } from '@photonjs/runtime/vite'

// After  
import { photon } from '@photonjs/core/vite'
```

3. Create your server entry:
```ts
// src/server.ts
import express from 'express'
import { apply, serve } from '@photonjs/express'

const app = express()
apply(app)
export default serve(app)
```

4. Update your config:
```ts
export default {
  plugins: [
    photon({
      server: './src/server.ts'
    })
  ]
}
```

## Examples

See the [examples directory](../../example) for complete working examples.

## License

MIT
