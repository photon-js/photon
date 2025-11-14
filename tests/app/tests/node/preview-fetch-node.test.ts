import { testRun } from "../testRun.js";

process.env.TARGET = "node";
process.env.SERVER = "fetch";

testRun("pnpm run preview");
