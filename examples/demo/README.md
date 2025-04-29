### demo: how to use PhotonJS

Relevant files:
- [server.ts](./server.ts): generic PhotonJS entry, compatible with any adapter
- [vite.config.ts](./vite.config.ts): this is where we define our PhotonJS entry, and declare Cloudflare adapter
- [wrangler.toml](./wrangler.toml): required when targetting cloudflare. Contains a `main` property pointing to a PhotonJS entry

### scripts

#### Run and build for node
```sh
# dev on node
pnpm run dev

# build for node runtime and runs `node dist/ssr/server.js`
pnpm run preview
```

#### Run and build for cloudflare
```sh
# dev on cloudflare workerd
pnpm run dev:cloudflare

# build for cloudflare runtime and run `vite preview`
pnpm run preview:cloudflare
```

#### Run and build for vercel
Coming soon
