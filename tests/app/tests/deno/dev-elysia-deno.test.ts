import { testRun } from "../testRun.js";

process.env.TARGET = "deno";
process.env.SERVER = "elysia";

testRun("deno run -A -q dev", {
  hmr: true,
});
