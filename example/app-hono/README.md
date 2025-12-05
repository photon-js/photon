# App using `awesome-framework` with a server entry

App using [`awesome-framework`](../awesome-framework) — a demo framework powered by Vite and Photon.

Relevant files:
- [server.ts](./server.ts): user server entry, can be any server that Photon supports (Hono, Express.js, Fastify, H3, ...)
- [vite.config.ts](./vite.config.ts): this is where the user tells Photon where his server entry lives

## scripts

```sh
# dev on node
pnpm run dev

# builds and run for node
pnpm run prod:node

# builds and run for bun
pnpm run prod:bun

# builds and run for deno
pnpm run prod:deno
```
