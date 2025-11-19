import { testRun } from "../testRun.js";

process.env.TARGET = "bun";
process.env.SERVER = "fetch";

testRun("bun --bun --silent run dev", {
  hmr: true,
});
