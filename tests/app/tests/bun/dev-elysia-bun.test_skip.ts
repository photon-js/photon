import { testRun } from "../testRun.js";

process.env.TARGET = "bun";
process.env.SERVER = "elysia";

// TODO: Waiting for bun 1.4.2 to rename the file and enable test again
//  See https://github.com/oven-sh/bun/issues/19111
testRun("bun --bun --silent run dev");
