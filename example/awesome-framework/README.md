# Framework powered by Vite and Photon

A demo framework showcasing how to integrate Photon into a Vite-based framework.

Most relevant files:
- [src/photon/middlewares/](./src/photon/middlewares): Defines [unidersal middlewares](https://github.com/magne4000/universal-middleware), for example [ssr.ts](./src/photon/middlewares/ssr.ts).
- [src/photon/entries/](./src/photon/entries): Exports the framework's middlewares. Leverages [exports conditions](./package.json) for adding middlewares conditionally.
- [src/vite/photonPlugin.ts](./src/vite/photonPlugin.ts): Integrates Photon.
