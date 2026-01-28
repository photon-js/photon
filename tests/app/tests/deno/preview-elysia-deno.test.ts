import { testRun } from "../testRun.js";

testRun("deno", "preview", "elysia", {
  // exit code 1
  tolerateError: true,
  serverIsReadyMessage: "Listening on:",
});
