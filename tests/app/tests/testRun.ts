import { fileURLToPath } from "node:url";
import {
  autoRetry,
  editFile,
  editFileRevert,
  expect,
  expectLog,
  fetch,
  fetchHtml,
  getServerUrl,
  page,
  run,
  sleep,
  test,
} from "@brillout/test-e2e";
import { findFile } from "pkg-types";
import { runCommandThatThrows } from "./utils.js";

export { testRun, testRunUnsupported };

type Runtimes = "node" | "bun" | "deno" | "cloudflare" | "vercel";
type Modes = "dev" | "preview";
type Servers = "elysia" | "express" | "fastify" | "fetch" | "srvx" | "h3" | "hono" | "hattip";

function getCmd(runtime: Runtimes, mode: Modes, server: Servers) {
  process.env.TARGET = runtime;
  process.env.SERVER = server;
  switch (runtime) {
    case "node":
      return `pnpm run ${mode}`;
    case "bun":
      return `bun --bun --silent run ${mode}`;
    case "deno":
      return `deno run -A -q ${mode}`;
    case "cloudflare":
      if (mode === "dev") return "pnpm run dev --strictPort --port 3000";
      return "pnpm run preview:vite --strictPort --port 3000";
    case "vercel":
      // Currently only dev is used for vercel tests
      if (mode === "dev") return "pnpm run dev --strictPort --port 3000";
      return "pnpm run preview:vite --strictPort --port 3000";
  }
}

function testRun(
  runtime: Runtimes,
  mode: Modes,
  server: Servers,
  options?: { hmr?: boolean | "prefer-restart" } & Parameters<typeof run>[1],
) {
  run(getCmd(runtime, mode, server), {
    // Preview => builds app which takes a long time
    additionalTimeout: 120 * 1000,
    ...options,
  });

  test("page content is rendered to HTML", async () => {
    const html = await fetchHtml("/");
    expect(html).toContain("<h1>Hello Vite!</h1>");
    expect(html).toContain('<button id="counter"');
  });

  test("page is rendered to the DOM and interactive", async () => {
    await page.goto(`${getServerUrl()}/`);
    expect(await page.textContent("h1")).toBe("Hello Vite!");
    await testCounter();
  });

  test("framework standalone handler is rendered", async () => {
    const text = await fetchHtml("/standalone");
    expect(text).toContain("standalone");
  });

  if (options?.hmr) {
    const entry = findFile("hmr-route.ts", {
      startingFrom: fileURLToPath(import.meta.url),
    });

    test("vite hmr websocket", async () => {
      await page.goto(`${getServerUrl()}/`);

      // Wait for the connection message
      await autoRetry(async () => {
        expectLog("[vite] connected.");
      });
    });

    test("server-side HMR", async () => {
      const getHmrText = async () => {
        const response = await fetch(`${getServerUrl()}/hmr`);
        return response.text();
      };

      expect(await getHmrText()).toBe("BEFORE HMR");

      editFile(await entry, (content) => content.replaceAll("BEFORE", "AFTER"));

      await sleep(300);
      await autoRetry(async () => {
        if (options.hmr === true) {
          expectLog("[vite] program reload");
        }
        expect(await getHmrText()).toBe("AFTER HMR");
      });

      editFileRevert();

      await sleep(300);
      await autoRetry(async () => {
        if (options.hmr === true) {
          expectLog("[vite] program reload");
        }
        expect(await getHmrText()).toBe("BEFORE HMR");
      });
    });
  }
}

async function testRunUnsupported(
  runtime: Runtimes,
  mode: Modes,
  server: Servers,
  options: { error?: string; errorAtStart?: boolean } = {},
) {
  const cmd = getCmd(runtime, mode, server);
  const { error = "is not supported while targetting", errorAtStart = false } = options;

  const isPreview = mode === "preview";

  if (isPreview) {
    await runCommandThatThrows(cmd, error);
  } else if (errorAtStart) {
    run(cmd, {
      additionalTimeout: 120 * 1000,
      serverIsReadyMessage: "VITE",
    });

    test("server crashes at start", async () => {
      expectLog(error, { allLogs: true });
    });
  } else {
    run(cmd, {
      additionalTimeout: 120 * 1000,
    });

    test("page crashes with error message", async () => {
      await fetchHtml("/");
      expectLog(error, { allLogs: true });
    });
  }
}

async function testCounter(currentValue = 0) {
  // autoRetry() in case page just got client-side navigated
  await autoRetry(
    async () => {
      const btn = page.locator("button", { hasText: "Counter" });
      expect(await btn.textContent()).toBe(`Counter ${currentValue}`);
    },
    { timeout: 5 * 1000 },
  );
  // autoRetry() in case page isn't hydrated yet
  await autoRetry(
    async () => {
      const btn = page.locator("button", { hasText: "Counter" });
      await btn.click();
      expect(await btn.textContent()).toBe(`Counter ${currentValue + 1}`);
    },
    { timeout: 5 * 1000 },
  );
}
