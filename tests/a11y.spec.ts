import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { openSite, scrollToFraction, settle } from './helpers'

/**
 * Serious and critical violations only. Axe's minor/moderate rules include things
 * this design deliberately does (decorative hairlines below 3:1, for one), and a
 * gate that cries wolf gets switched off.
 */
const LEVELS = ['serious', 'critical'] as const

const describe = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations
    .map((v) => `${v.impact}: ${v.id} — ${v.help} (${v.nodes.length} node(s))\n    ${v.nodes[0]?.html?.slice(0, 160)}`)
    .join('\n  ')

test.describe('accessibility', () => {
  test('main page has no serious or critical violations', async ({ page }) => {
    await openSite(page)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // The debug HUD only exists under ?debug=1 and never ships.
      .exclude('[data-debug-hud]')
      .analyze()

    const serious = results.violations.filter((v) => LEVELS.includes(v.impact as never))
    expect(serious.length, `\n  ${describe(serious)}`).toBe(0)
  })

  test('the fallback page has no serious or critical violations', async ({ page }) => {
    await page.goto('/fallback', { waitUntil: 'networkidle' })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const serious = results.violations.filter((v) => LEVELS.includes(v.impact as never))
    expect(serious.length, `\n  ${describe(serious)}`).toBe(0)
  })

  test('one h1, no heading level skips, every section labelled', async ({ page }) => {
    await openSite(page)

    const structure = await page.evaluate(() => {
      const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) =>
        Number(h.tagName[1]),
      )
      const skips: string[] = []
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) skips.push(`h${levels[i - 1]} -> h${levels[i]}`)
      }
      const unlabelled = [...document.querySelectorAll('[data-station]')]
        .map((s) => {
          const id = s.getAttribute('aria-labelledby')
          return id && document.getElementById(id) ? null : s.getAttribute('data-station')
        })
        .filter(Boolean)
      return { h1: levels.filter((l) => l === 1).length, skips, unlabelled }
    })

    expect(structure.h1).toBe(1)
    expect(structure.skips).toEqual([])
    expect(structure.unlabelled).toEqual([])
  })

  test('keyboard reaches every station and focus is always visible', async ({ page }) => {
    await openSite(page)

    // The Next dev overlay is a shadow host that swallows focus. It does not exist
    // in a production build, but strip it so the test says what it means.
    await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())

    const noRing: string[] = []
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(40)
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return null
        const cs = getComputedStyle(el)
        const ring =
          (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
          cs.boxShadow !== 'none'
        return { tag: el.tagName, label: (el.textContent ?? '').trim().slice(0, 28), ring }
      })
      if (info && !info.ring) noRing.push(`${info.tag} "${info.label}"`)
    }
    expect(noRing, `no visible focus ring on: ${noRing.join(', ')}`).toEqual([])
  })

  test('tabbing never leaves focus off-screen', async ({ page }) => {
    // Lenis owns scrolling, so the browser's native scroll-into-view is suppressed
    // and something has to put the focused element on screen deliberately.
    await openSite(page)
    await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())

    const offScreen: string[] = []
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab')
      /**
       * Focus-scroll hands the move to Lenis, which animates over roughly a second.
       * Waiting a fixed 120ms — or even 450ms — measures the middle of that
       * animation and reports elements as off-screen that are simply still on their
       * way. Wait for the scroll to actually stop.
       */
      await settle(page, { minMs: 700 })

      // Then poll: the station-nav panel slides in on focus, and a CSS transition
      // is not a scroll, so settling the scroll does not mean it has arrived.
      let bad: string | null = null
      for (let attempt = 0; attempt < 8; attempt++) {
        bad = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null
          if (!el || el === document.body) return null
          const r = el.getBoundingClientRect()
          if (r.width === 0 && r.height === 0) return null
          const visible = r.bottom > 0 && r.top < window.innerHeight
          return visible ? null : `${el.tagName} "${(el.textContent ?? '').trim().slice(0, 24)}"`
        })
        if (!bad) break
        await page.waitForTimeout(200)
      }
      if (bad) offScreen.push(bad)
    }
    expect(offScreen, `focused but off-screen: ${offScreen.join(', ')}`).toEqual([])
  })

  test('skip link works', async ({ page }) => {
    await openSite(page)
    await scrollToFraction(page, 0.5)
    await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(900)
    const focused = await page.evaluate(() => document.activeElement?.id ?? '')
    expect(focused).toBe('content')
  })
})
