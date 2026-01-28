import { testRun } from "../testRun.js";

testRun("deno", "dev", "hono", { hmr: true, serverIsReadyMessage: "Local:" });
