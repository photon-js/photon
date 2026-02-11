import { runCommandThatThrows } from "../utils.js";

process.env.TARGET = "node";
process.env.SERVER = "tests/non-photon-entry/express";

await runCommandThatThrows("pnpm run dev --strictPort --port 3000", "must include a { fetch() } function");
