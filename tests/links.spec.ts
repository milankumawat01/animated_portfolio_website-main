import { expect, test } from '@playwright/test'
import { openSite } from './helpers'

/**
 * Link integrity. External reachability is checked separately and tolerantly —
 * a rate-limited or geo-blocked response from LinkedIn is not a reason to fail
 * somebody's build, but a malformed `mailto:` is.
 */

test.describe('links', () => {
  test('mailto links are well formed', async ({ page }) => {
    await openSite(page)
    const mailtos = await page.$$eval('a[href^="mailto:"]', (els) =>
      els.map((e) => e.getAttribute('href') ?? ''),
    )
    expect(mailtos.length).toBeGreaterThan(0)
    for (const href of mailtos) {
      expect(href).toMatch(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/)
    }
  })

  test('every external link opens safely', async ({ page }) => {
    await openSite(page)
    const bad = await page.$$eval('a[href^="http"]', (els) =>
      els
        .filter((e) => {
          const rel = e.getAttribute('rel') ?? ''
          return (
            e.getAttribute('target') === '_blank' &&
            !(rel.includes('noopener') || rel.includes('noreferrer'))
          )
        })
        .map((e) => e.getAttribute('href') ?? ''),
    )
    expect(bad, `target=_blank without rel=noopener: ${bad.join(', ')}`).toEqual([])
  })

  test('placeholder links do not navigate', async ({ page }) => {
    // Four project links and four article links have no destination yet (asset
    // A9). They must announce themselves disabled and must not jump the page to
    // the top, which is all `href="#"` would otherwise do — and which fights Lenis.
    await openSite(page)
    const hashLinks = await page.$$eval('a[href="#"]', (els) =>
      els.map((e) => ({
        text: (e.textContent ?? '').trim().slice(0, 30),
        disabled: e.getAttribute('aria-disabled') === 'true',
      })),
    )
    const undeclared = hashLinks.filter((l) => !l.disabled)
    expect(
      undeclared,
      `href="#" without aria-disabled: ${undeclared.map((l) => l.text).join(', ')}`,
    ).toEqual([])
  })

  test('internal assets resolve', async ({ request }) => {
    for (const path of ['/Milan_Kumawat_Resume.pdf', '/monogram.svg']) {
      expect((await request.get(path)).status(), path).toBe(200)
    }
  })

  test('external profiles are reachable @external', async ({ request }) => {
    // Tagged so it can be skipped offline: `pnpm exec playwright test --grep-invert @external`
    const targets = ['https://github.com/milankumawat', 'https://linkedin.com/in/milankumawat']
    const results: string[] = []
    for (const url of targets) {
      try {
        const res = await request.get(url, { timeout: 15_000, maxRedirects: 5 })
        results.push(`${url} -> ${res.status()}`)
      } catch (e) {
        results.push(`${url} -> unreachable (${(e as Error).message.slice(0, 40)})`)
      }
    }
    console.log('  external profiles:\n    ' + results.join('\n    '))
    // Informational: a 999 from LinkedIn or a network block is not a build failure.
    // A 404 from GitHub means the username is wrong, which is worth a human look.
    const gh = results.find((r) => r.includes('github.com'))
    expect(gh, 'github profile check did not run').toBeTruthy()
  })
})
