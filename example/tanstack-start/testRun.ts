export { testRun };

import { expect, fetchHtml, getServerUrl, page, run, sleep, test } from "@brillout/test-e2e";

function testRun(cmd: `pnpm run ${string}`) {
  run(cmd, {
    // Preview => builds app which takes a long time
    additionalTimeout: 120 * 1000,
    serverIsReadyMessage: "http://localhost:3000/",
    tolerateError({ logText }) {
      // srvx
      if (logText.includes("Shutting down server")) return true;
      if (logText.includes("Server closed")) return true;
      return;
    },
  });

  test("page content is rendered to HTML", async () => {
    const html = await fetchHtml("/");
    expect(html).toContain("The framework for next generation AI applications");
  });

  test("page is rendered to the DOM and interactive", async () => {
    await page.goto(`${getServerUrl()}/demo/start/server-funcs`);
    await page.waitForLoadState("networkidle");

    const input = page.locator("input[type=text]");
    await input.fill("Use photon");
    const btn = page.locator("button", { hasText: "Add todo" });
    await btn.click();
    await sleep(300);
    expect(await page.textContent("#ul")).toContain(`Use photon`);
  });
}
