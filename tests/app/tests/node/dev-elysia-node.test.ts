import { testRun } from "../testRun.js";

process.env.TARGET = "node";
process.env.SERVER = "elysia";

testRun("pnpm run dev", { hmr: true });
