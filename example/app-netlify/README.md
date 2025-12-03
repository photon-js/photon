# App using `awesome-framework`

App using [`awesome-framework`](../awesome-framework) — a demo framework powered by Vite and Photon.

Relevant files:
- [vite.config.ts](./vite.config.ts): this is where the user tells Photon where additional entries can be found, and where the user adds Photon's Cloudflare adapter (if he doesn't use `@photonjs/auto`)
- [wrangler.toml](./wrangler.toml): required when targetting Cloudflare, contains a `main` property pointing to the Photon virtual entry
- [src/middlewares](./src/middlewares): Additional universal entries


## scripts

### Run and build for cloudflare

```sh
# dev on cloudflare workerd
pnpm run dev

# builds for cloudflare runtime and runs `$ vite preview`
pnpm run preview
```
