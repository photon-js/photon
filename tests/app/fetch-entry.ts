import awesomeEntry from "virtual:ud:catch-all?default";
import { apply } from "@photonjs/srvx";
import awesomeMiddlewares from "awesome-framework/middlewares";

const app = apply([...awesomeMiddlewares, awesomeEntry.fetch]);

export default {
  fetch: app,
};
