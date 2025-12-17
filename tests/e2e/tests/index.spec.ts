import { expect, type Page, test } from "@playwright/test";
import { goto } from "./utils.js";

test("page content is rendered to HTML", async ({ page }) => {
  await goto(page, "/");
  const h1 = page.locator("h1");
  await expect(h1).toHaveText("Hello Vite!");
  await expect(h1).toHaveCSS("font-size", "51.2px");
  const button = page.locator("button");
  await expect(button).toHaveId("counter");
  await expect(button).toHaveCSS("font-size", "16px");
});

test("page is rendered to the DOM and interactive", async ({ page }) => {
  await goto(page, "/");
  await testCounter(page);
});

test("/api", async ({ request }) => {
  const response = await request.get("/api");
  expect(await response.text()).toBe("The API Route");
});

test("/standalone", async ({ request }) => {
  const response = await request.get("/standalone");
  expect(await response.text()).toBe("The /standalone Route");
});

// test("/bar", async ({ request }) => {
//   const response = await request.get("/bar");
//   expect(await response.text()).toBe("bar");
// });
//
// test("/foo", async ({ request }) => {
//   const response = await request.get("/foo");
//   expect(await response.text()).toBe("foo");
// });

async function testCounter(page: Page, currentValue = 0) {
  const btn = page.locator("button", { hasText: "Counter" });

  // Wait for button to have correct text (auto-retries)
  await expect(btn).toHaveText(`Counter ${currentValue}`, { timeout: 5000 });

  // Click and verify new value (auto-retries)
  await btn.click();
  await expect(btn).toHaveText(`Counter ${currentValue + 1}`, { timeout: 5000 });
}
