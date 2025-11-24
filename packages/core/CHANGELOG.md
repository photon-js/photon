## [0.0.3](https://github.com/photon-js/photon/compare/@photonjs/core@0.0.2...@photonjs/core@0.0.3) (2025-08-20)

## 0.1.12

### Patch Changes

- e062fec: fix: ensure that dev server middleware is compatible with srvx
- cc7b79d: fix: bump @universal-middleware/express

## 0.1.11

### Patch Changes

- 0defb4b: fix: server-side HMR was sometimes not working as intended

## 0.1.10

### Patch Changes

- 8b9e36f: feat: allow async `resolveMiddlewares`
- a08595d: fix: onReady option was ignored

## 0.1.9

### Patch Changes

- 0d3faed: feat: do not generate `bun-index.js` whem compiling with bun --bun
- 0d3faed: feat(experimental): add support for frameworks defining ssr.rollupOptions.entry
- 0d3faed: feat(hmr): do not forward HMR WS requests through photon server
- 0d3faed: feat: support `{ fetch }` entries
- 0d3faed: feat: HMR support for Deno and Bun

## 0.1.8

### Patch Changes

- 230ab19: revert: fix: remove static analysis at build time (#37)

## 0.1.7

### Patch Changes

- 490b0f7: fix: re-release

## 0.1.6

### Patch Changes

- 12ee518: feat: disable static analysis during build
- 6951bd3: fix: handle multiple installs of Photon

## 0.1.5

### Patch Changes

- b80dab2: feat: export `installPhotonResolver`

## 0.1.4

### Patch Changes

- 5a4c3d5: fix: upgrade dependencies

## 0.1.3

### Patch Changes

- baaaaf9: fix: missing virtual prefix is zod literal

## 0.1.2

### Patch Changes

- 623579c: fix(deps): upgrade zod

## 0.1.1

### Patch Changes

- 589ae48: fix: ensure that no node side-effects are present
- f3472b7: refactor: prefix all virtual modules with virtual:

## 0.1.0

### Minor Changes

- 90c6e01: Release as 0.1.0

## 0.0.16

### Patch Changes

- d2e67f8: feat: upgrade dependencies

## 0.0.15

### Patch Changes

- 371c2e6: fix: ansis as a devDependency

## 0.0.14

### Patch Changes

- 8cb65bb: fix: replace @brillout/picocolors by ansis

## 0.0.13

### Patch Changes

- 5659f49: fix: properly compute optimizeDeps

## 0.0.12

### Patch Changes

- 5a90439: feat: upgrade dependencies

## 0.0.11

### Patch Changes

- 6a892a8: chore: dynamic node imports

## 0.0.10

### Patch Changes

- 20f3404: chore: improve cloudflare support

## 0.0.9

### Patch Changes

- 78e177a: fix: add @photonjs/srvx to noExternal

## 0.0.8

### Patch Changes

- 28135a8: feat: add support for srvx

## 0.0.7

### Patch Changes

- 33c4dfe: fix: do not import types files from compiled js

## 0.0.6

### Patch Changes

- 3792886: fix: re-export vite type overrides

## 0.0.5

### Patch Changes

- 12e246a: fix: add all servers packages to noExternal

## 0.0.4

### Patch Changes

- eb082b2: feat: split photon into multiple packages

### Features

- create a specific bun entry to avoid Bun.serve automatic call ([ea17856](https://github.com/photon-js/photon/commit/ea17856bd277ae80031bc04c863b13604cab5bf9))

## [0.0.2](https://github.com/photon-js/photon/compare/@photonjs/core@0.0.1...@photonjs/core@0.0.2) (2025-08-20)

### Bug Fixes

- bun and deno conditions ([fb12d4d](https://github.com/photon-js/photon/commit/fb12d4d04ec09f88405b60c17ce34d448379d6f9))

## 0.0.1 (2025-08-19)

### Bug Fixes

- always add fallback ([b82a35f](https://github.com/photon-js/photon/commit/b82a35f2bcacab59e9eb0b7e4a389c4db87e6d92))
- better virtual module resolution fix ([9ec0fa0](https://github.com/photon-js/photon/commit/9ec0fa06cbd9e72858fc173aec0905865cef32ff))
- better virtual module resolution fix ([1d77f1b](https://github.com/photon-js/photon/commit/1d77f1b66b818b5df9feae231ec4472f8e52e084))
- ensure fallback ([54dbf6e](https://github.com/photon-js/photon/commit/54dbf6ec406eeb46267c3e4ec09ae451d58895a3))
- generic module config for hotUpdate full-reload ([f396fdc](https://github.com/photon-js/photon/commit/f396fdc6c6afb21c2bd3760798816cfed82c4762))

### Features

- auto enhance handler with a route ([8e97aca](https://github.com/photon-js/photon/commit/8e97aca9534d41ea858772940987be9375de16ae))
- cloudflare adapter ([47c8653](https://github.com/photon-js/photon/commit/47c8653f5283cf57a6c5d95e877eedb0ecb7108a))
- improve core to support vercel ([d561ca3](https://github.com/photon-js/photon/commit/d561ca3894de6e54cceb38d523c0fa86725615ea))
- photon ([ef5acfe](https://github.com/photon-js/photon/commit/ef5acfe0557352088f551c714232ed1537077b7f))
- use non-index entries in dev and build ([a49037f](https://github.com/photon-js/photon/commit/a49037ff4409761300933be87a77e590cdd5394c))
