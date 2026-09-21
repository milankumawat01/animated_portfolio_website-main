'use client'

import { useEffect } from 'react'
import { getLenis } from '@/store/useScroll'
import { STATION_RANGES, fromCanonicalProgress } from '@/lib/curves'
import type { StationId } from '@/engine/types'

/**
 * THE SUBTLE ONE.
 *
 * Lenis owns scrolling: it keeps its own `animatedScroll`, drives the window from
 * GSAP's ticker, and treats any scroll it did not cause as an external jump to
 * absorb. The browser's sequential-focus navigation does exactly that — focusing an
 * off-screen element runs `scrollIntoView` inside the focusing steps, before the
 * `focus` event is even dispatched. The page lurches, Lenis re-syncs mid-lerp, and
 * the camera (which reads `scrollState.progress`) snaps with it. Every Tab into a
 * new station judders.
 *
 * Two layers stop it:
 *
 *  1. **Tab is handled here.** We resolve the next focusable element ourselves and
 *     call `focus({ preventScroll: true })`, so the native scroll never happens at
 *     all. This is the real fix — not a correction after the fact.
 *  2. **A `focusin` guard** catches everything Tab interception cannot see (a
 *     programmatic `focus()` elsewhere, a focus arriving from browser chrome, an
 *     element we failed to resolve). If the document moved without Lenis asking, we
 *     put it back in the same task — before the browser paints — and then animate.
 *
 * Once focus has landed and the element is off screen, we need a scroll target.
 * The station's own start is the right *anchor* — it is what the camera path is
 * parameterised on — but it is not enough on its own. Measured at 1440×900, tabbing
 * to the station start left the focused element below the fold on 46 of 120 steps:
 * Contact, Writing and Skills all have DOM taller than the pin window, so their
 * lower halves only come on screen later in the station's scroll.
 *
 * And the geometry is not linear. Each station's content is a `position: sticky`
 * child: before the section reaches the top of the viewport the child tracks the
 * scroll, then it pins and stops moving entirely, then — if it is taller than the
 * section's remaining travel — it starts moving again. An element's viewport
 * position is a piecewise function of scroll with a dead zone in the middle, so no
 * closed-form `documentTop - scroll` works.
 *
 * So `solveScrollFor` asks the browser instead. It sets `window.scrollTo`
 * synchronously, reads the element's rect — a forced layout that accounts for
 * sticky exactly — corrects, and repeats. All of it happens inside the `focusin`
 * handler, before the browser paints, and the original position is restored at the
 * end. Nothing is ever shown at the probe positions; only the solved target is
 * handed to Lenis, as one smooth move.
 */

/** Matches the native sequential-focus set closely enough for this document. */
const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'audio[controls]',
  'video[controls]',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex^="-"])',
].join(',')

/** Clearance for the fixed 72px header, plus breathing room at the bottom. */
const TOP_MARGIN = 96
const BOTTOM_MARGIN = 24

let programmatic = 0

/**
 * Suppresses the focus-scroll for one focus change. Used by anything that has
 * already decided where the page should go — the skip link, the station nav — so
 * moving focus to the destination does not immediately scroll somewhere else.
 */
export const beginProgrammaticFocus = (): void => {
  programmatic = performance.now()
}

const isProgrammatic = (): boolean => performance.now() - programmatic < 400

const isRendered = (el: HTMLElement): boolean => {
  // offsetParent is null for display:none and for position:fixed; check both.
  if (el.offsetParent !== null) return true
  const rect = el.getBoundingClientRect()
  return rect.width > 0 || rect.height > 0
}

const isTabbable = (el: HTMLElement): boolean => {
  if (el.hasAttribute('inert')) return false
  if (el.closest('[inert]')) return false
  if (el.closest('[aria-hidden="true"]')) return false
  if (el.getAttribute('tabindex') === '-1') return false
  if (!isRendered(el)) return false
  const style = getComputedStyle(el)
  if (style.visibility === 'hidden' || style.display === 'none') return false
  return true
}

const tabbables = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isTabbable)

const inViewport = (el: HTMLElement): boolean => {
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return true // nothing to bring into view
  return r.top >= TOP_MARGIN && r.bottom <= window.innerHeight - BOTTOM_MARGIN
}

/** Fixed elements (the nav, the skip link) never need the page to move. */
const isFixed = (el: HTMLElement): boolean => {
  let node: HTMLElement | null = el
  while (node && node !== document.body) {
    if (getComputedStyle(node).position === 'fixed') return true
    node = node.parentElement
  }
  return false
}

const scrollLimit = (): number =>
  Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

/**
 * Raw scroll position at which a station's content is on screen. Canonical progress
 * is what the manifests and the camera are written in; `fromCanonicalProgress`
 * remaps it to raw pixels, which is what matters when a station's DOM has outgrown
 * its nominal share of the page.
 */
const stationScroll = (station: StationId): number | null => {
  const range = STATION_RANGES[station]
  if (!range) return null
  const [start, end] = range
  const canonical = start + Math.min(0.02, (end - start) * 0.2)
  return fromCanonicalProgress(canonical) * scrollLimit()
}

/**
 * The scroll position that puts `el` fully in view, found by probing the real
 * layout. Synchronous, and it leaves the document exactly where it found it.
 */
const solveScrollFor = (el: HTMLElement, seed: number): number => {
  const restore = window.scrollY
  const limit = scrollLimit()
  let target = Math.max(0, Math.min(seed, limit))

  try {
    for (let i = 0; i < 4; i++) {
      window.scrollTo(0, target)
      const r = el.getBoundingClientRect() // forced layout; sticky is resolved
      const below = r.bottom - (window.innerHeight - BOTTOM_MARGIN)
      const above = TOP_MARGIN - r.top

      // Taller than the space available: align its top and let the rest run off.
      if (above > 0 && below > 0) {
        const next = Math.max(0, Math.min(target - above, limit))
        if (Math.abs(next - target) < 1) break
        target = next
        continue
      }
      if (below <= 0 && above <= 0) break

      const delta = below > 0 ? below : -above
      const next = Math.max(0, Math.min(target + delta, limit))
      // A sticky element pinned in its dead zone will not move however far we
      // scroll; when the correction stops changing anything, stop.
      if (Math.abs(next - target) < 1) break
      target = next
    }
  } finally {
    window.scrollTo(0, restore)
  }

  return target
}

export function FocusScroll() {
  useEffect(() => {
    /** Where the document was before the browser got a chance to move it. */
    let scrollBeforeFocus = window.scrollY

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) {
        return
      }

      scrollBeforeFocus = window.scrollY

      const list = tabbables()
      if (list.length === 0) return

      const active = document.activeElement as HTMLElement | null
      const index = active ? list.indexOf(active) : -1
      const step = e.shiftKey ? -1 : 1

      let next: HTMLElement | undefined
      if (index === -1) {
        // Focus is on <body> or somewhere outside the set — enter from the edge.
        next = e.shiftKey ? list[list.length - 1] : list[0]
      } else {
        next = list[index + step]
      }

      // At either end, let the browser move focus into its own chrome.
      if (!next) return

      e.preventDefault()
      next.focus({ preventScroll: true })
    }

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null
      if (!el || el === document.body) return

      const lenis = getLenis()

      /**
       * Guard: if something scrolled the document during the focus change and it
       * was not Lenis, undo it now. We are still in the same task as the focus
       * event, so the restored position is what gets painted — the jump is never
       * seen. `immediate` also writes Lenis's own target back, which is the part
       * that stops it lerping toward the browser's idea of where we are.
       */
      if (lenis && !lenis.isScrolling && Math.abs(window.scrollY - scrollBeforeFocus) > 1) {
        lenis.scrollTo(scrollBeforeFocus, { immediate: true, force: true })
      }

      if (isProgrammatic()) {
        scrollBeforeFocus = window.scrollY
        return
      }

      if (isFixed(el) || inViewport(el)) {
        scrollBeforeFocus = window.scrollY
        return
      }

      const section = el.closest<HTMLElement>('[data-station]')
      const station = section?.dataset.station as StationId | undefined

      /**
       * Seed from the station when there is one — that keeps the camera's anchor
       * honest — then let the layout correct it. Without a station (chrome outside
       * `<main>`) the current position is as good a seed as any.
       */
      const seed = (station ? stationScroll(station) : null) ?? window.scrollY
      const target = solveScrollFor(el, seed)
      const current = window.scrollY

      if (Math.abs(target - current) < 2) {
        scrollBeforeFocus = current
        return
      }

      if (lenis) {
        lenis.scrollTo(target, {
          duration: 1.1,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
          force: true,
        })
      } else {
        window.scrollTo({ top: target })
      }
      scrollBeforeFocus = window.scrollY
    }

    // Capture phase for keydown so we win before anything else handles Tab.
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [])

  return null
}
