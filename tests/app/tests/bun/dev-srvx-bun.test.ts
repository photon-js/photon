import { testRun } from "../testRun.js";

process.env.TARGET = "bun";
process.env.SERVER = "srvx";

testRun("bun --bun --silent run dev", {
  hmr: true,
});
