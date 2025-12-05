import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

const additionalConfig: PlaywrightTestConfig = {};

if (process.env.BASE_URL) {
} else {
  /* Run your local dev server before starting the tests */
  additionalConfig.webServer = {
    command: process.env.RUN_CMD ?? "pnpm run dev --port 3000",
    url: "http://localhost:3000",
  };
}

if (process.env.CI) {
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  additionalConfig.forbidOnly = true;
  /* Retry on CI only */
  additionalConfig.retries = 2;
  /* Opt out of parallel tests on CI. */
  additionalConfig.workers = 1;
} else {
  additionalConfig.forbidOnly = false;
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...additionalConfig,
  testDir: "../../tests/e2e/tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  preserveOutput: "never",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    /* process.env.BASE_URL is provided by the CI */
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
