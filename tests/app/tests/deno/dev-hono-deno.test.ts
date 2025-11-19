import { testRun } from "../testRun.js";

process.env.TARGET = "deno";
process.env.SERVER = "hono";

testRun("deno run -A -q dev", {
  hmr: true,
});
