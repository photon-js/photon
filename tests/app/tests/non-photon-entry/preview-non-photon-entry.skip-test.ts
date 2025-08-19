import { runCommandThatThrows } from "../utils.js";

process.env.TARGET = "node";
process.env.SERVER = "tests/non-photon-entry/express";

// TODO update code then this test so that during build, missing { apply } import crashes
await runCommandThatThrows("pnpm run preview", "Cannot guess", "server type. Make sure to use");
