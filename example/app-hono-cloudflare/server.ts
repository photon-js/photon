import { apply, serve } from "@photonjs/hono";
import { Hono } from "hono";

async function startServer() {
  const app = new Hono();

  // awesomeFramework will automatically be injected by apply
  apply(app);

  return serve(app);
}

export default await startServer();
