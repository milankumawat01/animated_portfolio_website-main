import { expect, test } from '@playwright/test'
import { STATIONS, openSite } from './helpers'

test.describe('smoke', () => {
  test('page loads, preloader dismisses, all eight stations exist', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

    await openSite(page)

    await expect(page.locator('[data-preloader]')).toHaveCount(0)

    const stations = await page.$$eval('[data-station]', (els) =>
      els.map((e) => e.getAttribute('data-station')),
    )
    expect(stations).toEqual([...STATIONS])

    expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([])
  })

  test('the page is the height the camera path expects', async ({ page }) => {
    await openSite(page)
    const ratio = await page.evaluate(
      () => document.body.scrollHeight / window.innerHeight,
    )
    // 8 stations x 1.6 viewports. Allowed to grow on a narrow screen where copy
    // is taller — never allowed to be shorter, which would truncate the flight.
    expect(ratio).toBeGreaterThan(12.5)
  })

  test('no horizontal overflow', async ({ page }) => {
    await openSite(page)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(overflow).toBe(false)
  })

  test('the copy is in the server-rendered HTML', async ({ request }) => {
    // If the text is not in the raw bytes, SEO has failed regardless of what the
    // hydrated page looks like.
    const html = await (await request.get('/')).text()
    for (const needle of [
      'Milan',
      'Kumawat',
      'Turning ideas',
      'Hiro',
      'True Value Infosoft',
      'Designing Scalable Backend Systems',
      'while (curiosity)',
      'Jaipur, India',
    ]) {
      expect(html, `missing from SSR HTML: ${needle}`).toContain(needle)
    }
  })

  test('robots, sitemap and the OG image all resolve', async ({ request }) => {
    for (const path of ['/robots.txt', '/sitemap.xml', '/opengraph-image', '/icon.svg']) {
      const res = await request.get(path)
      expect(res.status(), `${path} returned ${res.status()}`).toBe(200)
    }
  })

  test('the resume PDF downloads and is a real PDF', async ({ request }) => {
    const res = await request.get('/Milan_Kumawat_Resume.pdf')
    expect(res.status()).toBe(200)
    const body = await res.body()
    expect(body.subarray(0, 5).toString()).toBe('%PDF-')
    expect(body.byteLength).toBeGreaterThan(10_000)
  })
})
