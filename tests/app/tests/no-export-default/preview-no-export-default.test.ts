import { expectLog, fetchHtml, run, test } from "@brillout/test-e2e";

process.env.TARGET = "cloudflare";
process.env.SERVER = "tests/no-export-default/hono";

run("pnpm run preview:vite --strictPort --port 3000");

test("page crashes with error message", async () => {
  await fetchHtml("/");
  expectLog('"default" is not exported by');
});
