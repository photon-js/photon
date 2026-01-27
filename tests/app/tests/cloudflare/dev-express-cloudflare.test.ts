import { testRunUnsupported } from "../testRun.js";

await testRunUnsupported("cloudflare", "dev", "express", {
  throwAtStart: true,
  error: "Failed to load url node:http",
});
