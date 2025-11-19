import { testRunUnsupported } from "../testRun.js";

process.env.TARGET = "bun";
process.env.SERVER = "express";

await testRunUnsupported("bun --bun --silent run preview", {
  error: "Express does not support the `fetch` interface",
});
