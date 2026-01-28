import { testRunUnsupported } from "../testRun.js";

await testRunUnsupported("cloudflare", "preview", "express", {
  throwAtStart: true,
  error: 'Unexpected Node.js imports for environment "ssr"',
});
