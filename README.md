# Photon

- [packages/photonjs](./packages/photonjs) - Photon core
- [packages/adapter-cloudflare](./packages/adapter-cloudflare) - Photon cloudflare adapter
- [example/awesome-framework](./example/awesome-framework) - Example of integrating Photon into a Vite-based framework
- [example/app-cloudflare](./example/app-cloudflare) - Example of a user app using a framework powered by Photon
- [example/app-hono-cloudflare](./example/app-hono-cloudflare) - Example of a user app using a framework powered by Photon + Hono

## Goal

 - [Nitro](https://nitro.build) alternative that is unopinionated and flexible
 - Like Nitro: works with any deployment target (Netlify, Vercel, Cloudflare, VPS, ...)
 - Unlike Nitro: works with any server (Hono, Express, Fastify, Elysia, ...)
 - Easy integration for Vite-based frameworks
 - Server code-splitting: each page (and API route) can be deployed to seperate edge workers
 - Official integration/partnering with Netlify, Cloudflare, Vercel, and more
 - Powered by Vite's Environment API
 - HMR
 - Polished DX (e.g. first-class TypeScript support)
