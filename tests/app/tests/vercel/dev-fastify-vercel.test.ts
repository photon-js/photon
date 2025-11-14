import { testRun } from "../testRun.js";

process.env.TARGET = "vercel";
process.env.SERVER = "fastify";

testRun("pnpm run dev --strictPort --port 3000");
