### demo: how to integrate PhotonJS in your framework?

Most relevant files are contained in [src/photon](./src/photon) folder:
- [handlers](./src/photon/handlers): Here are defined handlers for specific routes, the most important one being [default-handler.ts](./src/photon/handlers/default-handler.ts), as it's the default render of our framework
- [middlewares](./src/photon/middlewares): Exports all required middlewares to make the framework 100% operational, including handlers. Leverages [exports conditions](./package.json) to include middlewares conditionally.
- [plugins](./src/plugins/index.ts): Use `installPhoton` helper as part of the framework own plugins.
