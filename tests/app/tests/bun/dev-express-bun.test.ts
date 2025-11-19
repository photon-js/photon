import { testRunUnsupported } from "../testRun.js";

process.env.TARGET = "bun";
process.env.SERVER = "express";

await testRunUnsupported("bun --bun --silent run dev", {
  error: "Express does not support the `fetch` interface",
  errorAtStart: true,
});
