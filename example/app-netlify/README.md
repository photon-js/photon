# App using `awesome-framework`

App using [`awesome-framework`](../awesome-framework) — a demo framework powered by Vite and Photon.

Relevant files:
- [vite.config.ts](./vite.config.ts): this is where the user tells Photon where additional entries can be found, and where the user adds Photon's Cloudflare adapter (if he doesn't use `@photonjs/auto`)
- [src/middlewares](./src/middlewares): Additional universal entries


## scripts

### Run and build for cloudflare

```sh
# dev with Netlify middleware
pnpm run dev

# builds for Netlify runtime
pnpm run build
```
