import { testRun } from "../testRun.js";

process.env.TARGET = "bun";
process.env.SERVER = "h3";

testRun("bun --bun --silent run dev", {
  hmr: true,
});
