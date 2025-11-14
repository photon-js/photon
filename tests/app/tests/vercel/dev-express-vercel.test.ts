import { testRun } from "../testRun.js";

process.env.TARGET = "vercel";
process.env.SERVER = "express";

testRun("pnpm run dev --strictPort --port 3000");
