import { expectLog, fetchHtml, run, test } from "@brillout/test-e2e";

process.env.TARGET = "node";
process.env.SERVER = "tests/non-photon-entry/express";

run("pnpm run dev", {
  serverIsReadyMessage: "ready in",
});

test("server launches with error message", async () => {
  await fetchHtml("/");
  expectLog("must include a { fetch() } function");
});
