# @photonjs/runtime

A convenience package that provides Photon with automatic fallback functionality for quick prototyping and development.

## Overview

The runtime package is designed to make getting started with Photon as simple as possible by:
- **Automatic fallback**: Provides a default minimal server when no server entry is specified
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

## Examples

See the [examples directory](../../example) for complete working examples.

## License

MIT
