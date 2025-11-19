import { testRun } from "../testRun.js";

process.env.TARGET = "bun";
process.env.SERVER = "elysia";

testRun("bun --bun --silent run preview");
