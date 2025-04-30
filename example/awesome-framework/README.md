### Integrating Photon into a Vite-based framework

Most relevant files:
- [src/photon/handlers/](./src/photon/handlers): Here are defined handlers for specific routes, the most important one being [default-handler.ts](./src/photon/handlers/default-handler.ts), as it's the default render of the framework.
- [src/photon/middlewares/](./src/photon/middlewares): Exports all the framework's middlewares. Leverages [exports conditions](./package.json) to include middlewares conditionally.
- [src/plugins/](./src/plugins/index.ts): Uses `installPhoton()` to add Photon's Vite plugin.
