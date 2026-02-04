import { testRunUnsupported } from "../testRun.js";

await testRunUnsupported("bun", "dev", "express", {
  error: "Internal server error",
});
