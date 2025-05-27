# App using `awesome-framework` with a server entry

App using [`awesome-framework`](../awesome-framework) — a demo framework powered by Vite and Photon.

Relevant files:
- [server.ts](./server.ts): user server entry, can be any server that Photon supports (Hono, Express.js, Fastify, H3, ...)
- [vite.config.ts](./vite.config.ts): this is where the user tells Photon where his server entry lives, and where the user adds Photon's Cloudflare adapter (if he doesn't use `@photonjs/auto`)
- [wrangler.toml](./wrangler.toml): required when targetting Cloudflare, contains a `main` property pointing to the Cloudflare entry
- [cloudflare-entry.ts](./cloudflare-entry.ts): Imports and use a Photon virtual file (the "real server entry" wrapping the user server entry)

## scripts

### Run and build for node

```sh
# dev on node
pnpm run dev

# builds for node runtime and runs `$ node dist/server/index.js`
pnpm run preview
```

### Run and build for cloudflare

```sh
# dev on cloudflare workerd
pnpm run dev:cloudflare

# builds for cloudflare runtime and runs `$ vite preview`
pnpm run preview:cloudflare
```

### Run and build for vercel

Coming soon

### Demo with a virtual entry

Coming soon
