import { expectLog, fetchHtml, run, test } from "@brillout/test-e2e";

process.env.TARGET = "cloudflare";
process.env.SERVER = "tests/no-export-default/hono";

run("pnpm run dev --strictPort --port 3000", {
  tolerateError({ logText }) {
    return logText.includes("Failed to parse server entry options");
  },
});

test("page crashes with error message", async () => {
  await fetchHtml("/");
  expectLog('Expected "default" export');
});
