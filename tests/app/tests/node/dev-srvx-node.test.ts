import { testRun } from "../testRun.js";

process.env.TARGET = "node";
process.env.SERVER = "srvx";

testRun("pnpm run dev", { hmr: true });
