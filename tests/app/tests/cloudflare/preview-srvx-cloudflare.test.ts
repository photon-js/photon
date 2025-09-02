import { testRun } from "../testRun.js";

process.env.TARGET = "cloudflare";
process.env.SERVER = "srvx";

testRun("pnpm run preview:vite --strictPort --port 3000");
