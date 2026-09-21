import { expect, test } from '@playwright/test'
import { STATIONS, activeStation, openSite, scrollToFraction, scrollToStation, settle, theme } from './helpers'

test.describe('scroll and camera', () => {
  test('the camera visits every station in order', async ({ page }) => {
    await openSite(page)
    const seen: string[] = []
    for (let i = 0; i <= 40; i++) {
      await scrollToFraction(page, i / 40)
      const s = await activeStation(page)
      if (s && seen[seen.length - 1] !== s) seen.push(s)
    }
    expect(seen).toEqual([...STATIONS])
  })

  test('the camera path has no discontinuity', async ({ page }) => {
    await openSite(page)
    let last: number[] | null = null
    let maxStep = 0
    let at = 0
    for (let i = 0; i <= 40; i++) {
      await scrollToFraction(page, i / 40)
      const cam = await page.evaluate(() => window.__cameraProbe ?? null)
      if (!cam) continue
      if (last) {
        const d = Math.hypot(cam[0] - last[0], cam[1] - last[1], cam[2] - last[2])
        if (d > maxStep) {
          maxStep = d
          at = i / 40
        }
      }
      last = [...cam]
    }
    // The whole path is ~300 units over 40 samples, so ~7.5 average. A seam at a
    // station boundary would show up as a step several times that.
    expect(maxStep, `largest step ${maxStep.toFixed(1)}u at ${at.toFixed(2)}`).toBeLessThan(40)
  })

  test('theme flips dark -> light -> dark at the right boundaries', async ({ page }) => {
    await openSite(page)

    await scrollToStation(page, 'hero')
    expect(await theme(page)).toBe('dark')

    for (const light of ['about', 'projects', 'experience', 'skills', 'build', 'writing'] as const) {
      await scrollToStation(page, light)
      expect(await theme(page), `${light} should be light`).toBe('light')
    }

    await scrollToStation(page, 'contact')
    expect(await theme(page)).toBe('dark')
  })

  test("the active station's DOM is always on screen", async ({ page }) => {
    // The one invariant that keeps the 3D and the DOM telling the same story.
    await openSite(page)
    const offScreen: string[] = []
    for (let i = 0; i <= 24; i++) {
      await scrollToFraction(page, i / 24)
      const bad = await page.evaluate(() => {
        const active = window.__scrollState?.activeStation
        if (!active) return 'no __scrollState'
        const el = document.querySelector(`[data-station="${active}"]`)
        if (!el) return `${active}: missing`
        const r = el.getBoundingClientRect()
        return r.bottom > 0 && r.top < window.innerHeight ? null : `${active}: off-screen`
      })
      if (bad) offScreen.push(`${(i / 24).toFixed(2)} ${bad}`)
    }
    expect(offScreen).toEqual([])
  })

  test('nav links travel to their station', async ({ page }) => {
    await openSite(page)
    await scrollToFraction(page, 0)
    await page.locator('header nav ul li button', { hasText: 'Projects' }).click()
    await settle(page)
    const p = await page.evaluate(() => window.__scrollState?.progress ?? -1)
    expect(p).toBeGreaterThan(0.22)
    expect(p).toBeLessThan(0.3)
  })

  test.describe('quality tiers', () => {
    for (const q of ['low', 'medium', 'high'] as const) {
      test(`?q=${q} applies and renders without errors`, async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

        await openSite(page, `&q=${q}`)
        await scrollToFraction(page, 0.3)

        const hud = await page.locator('[data-debug-hud]').innerText()
        expect(hud).toMatch(new RegExp(`tier\\s+${q}`))
        expect(errors, errors.join(' | ')).toEqual([])
      })
    }
  })

  test('reduced motion is honoured and scroll still navigates', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

    await openSite(page)
    expect(await page.locator('[data-debug-hud]').innerText()).toMatch(/reduced motion\s+yes/)

    // Nothing may be left stuck behind a blur — the reduced-motion variants have to
    // declare the same keys as the normal ones or the initial blur never clears.
    await scrollToFraction(page, 0.3)
    const blurred = await page.evaluate(
      () =>
        [...document.querySelectorAll('main *')].filter((el) => {
          const f = getComputedStyle(el).filter
          return f && f !== 'none' && /blur\((?!0px)/.test(f)
        }).length,
    )
    expect(blurred, 'elements left stuck behind a blur').toBe(0)

    await scrollToFraction(page, 0.95)
    expect(await activeStation(page)).toBe('contact')

    expect(errors, errors.join(' | ')).toEqual([])
    await ctx.close()
  })

  test('without WebGL the DOM is still a complete portfolio', async ({ browser }) => {
    const ctx = await browser.newContext()
    // Null only the WebGL contexts. Nulling getContext wholesale also kills 2D,
    // which breaks the procedural textures and is not what a real refusal looks like.
    await ctx.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, id: string, ...rest: unknown[]) {
        if (id === 'webgl' || id === 'webgl2' || id === 'experimental-webgl') return null
        return (original as unknown as (...a: unknown[]) => unknown).call(this, id, ...rest)
      } as typeof HTMLCanvasElement.prototype.getContext
    })
    const page = await ctx.newPage()
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2500)

    expect(await page.locator('canvas').count()).toBe(0)
    expect(await page.locator('[data-station]').count()).toBe(8)
    expect(await page.evaluate(() => document.documentElement.dataset.webgl)).toBe('off')

    // The theme must still change: SceneDirector normally drives it and it is
    // inside the canvas, so without a stand-in every light station renders dark.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.3, behavior: 'instant' }))
    await page.waitForTimeout(900)
    expect(await theme(page)).toBe('light')

    await ctx.close()
  })
})
