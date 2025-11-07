import { testRun } from "../testRun.js";

process.env.TARGET = "vercel";
process.env.SERVER = "srvx";

testRun("pnpm run dev --strictPort --port 3000");
