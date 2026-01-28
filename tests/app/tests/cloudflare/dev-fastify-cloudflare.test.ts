import { testRunUnsupported } from "../testRun.js";

await testRunUnsupported("cloudflare", "dev", "fastify", {
  throwAtStart: true,
  error: "Failed to load url node:http",
});
