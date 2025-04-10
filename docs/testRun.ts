export { testRun }

import { test, expect, run, fetchHtml, page, getServerUrl } from '@brillout/test-e2e'

function testRun(cmd: 'pnpm run dev' | 'pnpm run preview') {
  {
    // Preview => `npm run preview` takes a long time
    // Dev => `Learn more collapsible` takes a long time
    const additionalTimeout = 120 * 1000
    run(cmd, { additionalTimeout })
  }

  const landingPageUrl = '/'
  test(landingPageUrl, async () => {
    const html = await fetchHtml(landingPageUrl)
    expect(getTitle(html)).toBe('DocPress Demo')
    expect(html).toContain('Introduction')
    await page.goto(getServerUrl() + landingPageUrl)
  })

  const orphanURL = '/orphan'
  test(orphanURL, async () => {
    await page.goto(getServerUrl() + orphanURL)
    const text = await page.textContent('body')
    expect(text).toContain(`This page is "detached": it isn't included in the left-side navigation.`)
    expect(text).toContain(`Another Orphan Page Without Headings.`)
    expect(text).toContain(`Same page link for orphan page: Some SecTion.`)
    {
      const html = await fetchHtml(orphanURL)
      expect(getTitle(html)).toBe('Orphan Page | Demo')
    }
  })

  const featuresURL = '/features'
  test(featuresURL, async () => {
    await page.goto(getServerUrl() + featuresURL)
    const text = await page.textContent('body')
    expect(text).toContain('Features')
    expect(text).toContain('Edit this page')
    expect(text).toContain('This page is for testing/developing DocPress features.')
    expect(text).toContain('Guides > Some Page (basic link)')
    expect(text).toContain('Orphan Page (link to detached page)')
    expect(text).toContain('<Link> (same-page link, non-inferred original heading title without needing sectionTitles)')
    expect(text).toContain('Basic (same-page link, sub heading)')
    {
      const html = await fetchHtml(featuresURL)
      expect(getTitle(html)).toBe('Features | Demo')
    }
  })
}

function getTitle(html: string) {
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]
  return title
}
