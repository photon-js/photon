export { testRun }

import { autoRetry, expect, fetchHtml, getServerUrl, page, run, test } from '@brillout/test-e2e'

function testRun(cmd: `pnpm run ${string}`) {
  run(cmd, {
    // Preview => builds app which takes a long time
    additionalTimeout: 120 * 1000,
  })

  test('page content is rendered to HTML', async () => {
    const html = await fetchHtml('/')
    expect(html).toContain('<h1>Hello Vite!</h1>')
    expect(html).toContain('<button id="counter"')
  })

  test('page is rendered to the DOM and interactive', async () => {
    await page.goto(`${getServerUrl()}/`)
    expect(await page.textContent('h1')).toBe('Hello Vite!')
    await testCounter()
  })
}

async function testCounter(currentValue = 0) {
  // autoRetry() in case page just got client-side navigated
  await autoRetry(
    async () => {
      const btn = page.locator('button', { hasText: 'Counter' })
      expect(await btn.textContent()).toBe(`Counter ${currentValue}`)
    },
    { timeout: 5 * 1000 },
  )
  // autoRetry() in case page isn't hydrated yet
  await autoRetry(
    async () => {
      const btn = page.locator('button', { hasText: 'Counter' })
      await btn.click()
      expect(await btn.textContent()).toBe(`Counter ${currentValue + 1}`)
    },
    { timeout: 5 * 1000 },
  )
}
