import { testRun } from "../testRun.js";

testRun("deno", "dev", "elysia", { hmr: true, serverIsReadyMessage: "Local:" });
