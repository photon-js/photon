import { testRunUnsupported } from "../testRun.js";

await testRunUnsupported("bun", "dev", "express", {
  error: "Express does not support the `fetch` interface",
  errorAtStart: true,
});
