# App using `awesome-framework`

App using [`awesome-framework`](../awesome-framework) — a demo framework powered by Vite and Photon.

Relevant files:
- [vite.config.ts](./vite.config.ts): this is where the user tells Photon where additional entries can be found, and where the user adds Photon's Cloudflare adapter (if he doesn't use `@photonjs/auto`)
- [wrangler.toml](./wrangler.toml): required when targetting Cloudflare, contains a `main` property pointing to a Photon virtual file (the "real server entry" wrapping the user server entry)
- [src/middlewares](./src/middlewares): Additional universal entries


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
