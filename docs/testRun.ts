export { testRun };

import { test, run, fetchHtml, page, getServerUrl, expect } from "@brillout/test-e2e";

function testRun(cmd: "pnpm run dev" | "pnpm run preview") {
  run(cmd, { additionalTimeout: 120 * 1000 });

  const landingPageUrl = "/";
  test(landingPageUrl, async () => {
    const html = await fetchHtml(landingPageUrl);
    expect(html).toContain("Photon");
    await page.goto(getServerUrl() + landingPageUrl);
    const text = await page.textContent("body");
    expect(text).toContain("Photon");
  });
}
