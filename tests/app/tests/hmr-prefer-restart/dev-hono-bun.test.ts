import { testRun } from "../testRun.js";

process.env.TARGET = "bun";
process.env.SERVER = "hono";

testRun("bun --bun --silent run dev", {
  hmr: "prefer-restart",
});
