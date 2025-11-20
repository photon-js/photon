import { apply } from "@photonjs/srvx";
import { hmrRoute } from "./hmr-route.js";

// Auto applies `awesomeFramework`
const app = apply(
  // HMR route
  [hmrRoute],
);

export default {
  fetch: app,
};
