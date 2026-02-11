import { expectLog, fetchHtml, run, test } from "@brillout/test-e2e";

process.env.TARGET = "node";
process.env.SERVER = "tests/non-photon-entry/express";

run("pnpm run dev --strictPort --port 3000", {
  tolerateError({ logText }) {
    return logText.includes("Failed to parse server entry options");
  },
});

test("page crashes with error message", async () => {
  await fetchHtml("/");
  expectLog("must include a { fetch() } function");
});
