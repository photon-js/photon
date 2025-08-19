import { testRunUnsupported } from "../testRun.js";

process.env.TARGET = "cloudflare";
process.env.SERVER = "fastify";

await testRunUnsupported("pnpm run preview:vite --strictPort --port 3000");
