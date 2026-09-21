import type { Page } from '@playwright/test'

/**
 * Shared helpers. The important one is `settle`: the page is scroll-driven and
 * everything in it is damped, so an assertion taken immediately after a scroll is
 * measuring the previous position. Under software rasterisation that lag is
 * hundreds of milliseconds, which is exactly how flaky suites are born.
 */

export const STATIONS = [
  'hero',
  'about',
  'projects',
  'experience',
  'skills',
  'build',
  'writing',
  'contact',
] as const

export type Station = (typeof STATIONS)[number]

declare global {
  interface Window {
    __lenis?: { scrollTo: (t: number, o?: Record<string, unknown>) => void }
    __scrollState?: {
      progress: number
      velocity: number
      activeStation: Station
      localProgress: number
    }
    __frameStats?: { drawCalls: number; triangles: number; fps: number }
    __cameraProbe?: number[]
  }
}

/** Load the page with the debug hooks on, and wait for the preloader to go. */
export const openSite = async (page: Page, query = '') => {
  await page.goto(`/?debug=1${query}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.querySelectorAll('[data-preloader]').length === 0, {
    timeout: 30_000,
  })
  await page.waitForTimeout(600)
}

/** Scroll to a fraction of the page and wait for the damped state to catch up. */
export const scrollToFraction = async (page: Page, fraction: number) => {
  await page.evaluate((f) => {
    const top = (document.body.scrollHeight - window.innerHeight) * f
    if (window.__lenis) window.__lenis.scrollTo(top, { immediate: true, force: true })
    else window.scrollTo({ top, behavior: 'instant' })
  }, fraction)
  await settle(page)
}

/**
 * Wait until the reported progress stops moving.
 *
 * It requires several *consecutive* stable samples and a minimum elapsed time. An
 * earlier version returned as soon as two samples agreed, which could not tell
 * "the scroll has finished" from "the scroll has not started yet" — so it happily
 * reported the previous position and produced failures that looked like engine bugs.
 */
export const settle = async (page: Page, { minMs = 500, tries = 60 } = {}) => {
  const start = Date.now()
  let last = Number.NaN
  let stable = 0
  for (let i = 0; i < tries; i++) {
    await page.waitForTimeout(80)
    const p = await page.evaluate(() => window.__scrollState?.progress ?? -1)
    stable = Math.abs(p - last) < 0.0002 ? stable + 1 : 0
    last = p
    if (stable >= 3 && Date.now() - start >= minMs) return
  }
}

/** Scroll so a station is active, using the app's own canonical ranges. */
export const scrollToStation = async (page: Page, station: Station) => {
  const RANGES: Record<Station, [number, number]> = {
    hero: [0.0, 0.11],
    about: [0.11, 0.23],
    projects: [0.23, 0.4],
    experience: [0.4, 0.55],
    skills: [0.55, 0.68],
    build: [0.68, 0.8],
    writing: [0.8, 0.91],
    contact: [0.91, 1.0],
  }
  const [a, b] = RANGES[station]
  const target = a + (b - a) * 0.5

  /**
   * Canonical progress is not the same as the scrollbar fraction: a station whose
   * DOM outgrew its allotted share shifts everything after it. So converge on it,
   * awaiting a settle each time — the mapping is monotonic and close to the
   * identity, so this lands in one or two steps.
   *
   * (Doing the search inside a single page.evaluate does not work: progress is
   * written by the GSAP ticker, which cannot run during a synchronous loop.)
   */
  let guess = target
  for (let i = 0; i < 5; i++) {
    await scrollToFraction(page, guess)
    const p = await page.evaluate(() => window.__scrollState?.progress ?? -1)
    const err = target - p
    if (Math.abs(err) < 0.005) return
    guess = Math.min(1, Math.max(0, guess + err))
  }
}

export const activeStation = (page: Page) =>
  page.evaluate(() => window.__scrollState?.activeStation ?? null)

export const theme = (page: Page) =>
  page.evaluate(() => document.documentElement.getAttribute('data-theme'))
