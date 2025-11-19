import { testRunUnsupported } from "../testRun.js";

await testRunUnsupported("bun", "preview", "express", {
  error: "Express does not support the `fetch` interface",
});
