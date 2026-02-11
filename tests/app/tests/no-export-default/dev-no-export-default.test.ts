import { runCommandThatThrows } from "../utils.js";

process.env.TARGET = "cloudflare";
process.env.SERVER = "tests/no-export-default/hono";

await runCommandThatThrows("pnpm run dev --strictPort --port 3000", "must include a { fetch() } function");
