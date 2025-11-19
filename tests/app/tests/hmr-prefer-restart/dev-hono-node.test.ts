import { testRun } from "../testRun.js";

process.env.TARGET = "node";
process.env.SERVER = "hono";

testRun("bun --bun --silent run dev", {
  hmr: "prefer-restart",
});
