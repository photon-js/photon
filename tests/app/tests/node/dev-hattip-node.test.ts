import { testRun } from "../testRun.js";

process.env.TARGET = "node";
process.env.SERVER = "hattip";

testRun("pnpm run dev", { hmr: true });
