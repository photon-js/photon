import { apply } from "@photonjs/srvx";
import awesomeMiddlewares from "awesome-framework/middlewares";
import awesomeEntry from "awesome-framework/server-entry";

const app = apply([...awesomeMiddlewares, awesomeEntry.fetch]);

export default {
  fetch: app,
};
