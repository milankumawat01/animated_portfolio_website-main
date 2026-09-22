'use client'

import { useEffect, useRef } from 'react'
import { useScroll } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'

/**
 * A brief dim over the page as the camera crosses a station boundary.
 *
 * It sells "arrival" without an interstitial. It has to stay this small: anything
 * more and it becomes a page transition, which is exactly the thing a single
 * continuous scroll is supposed to avoid.
 *
 * ## Why it is an overlay and not a filter
 *
 * This used to set `filter: brightness(0.94)` and a 2px `translate3d` on `#content`
 * itself. `#content` is the entire scrolling column — roughly thirteen viewports of
 * text, cards and images — and applying a filter to it promotes the whole thing to
 * its own compositing layer, repaints it, and then tears the layer down again 440ms
 * later. That happened at all eight boundaries, on exactly the frames the camera was
 * already busiest. A filter on an ancestor also makes it the containing block for
 * any `position: fixed` descendant, so anything fixed inside the column jumped for
 * the duration.
 *
 * Fading one fixed, empty, pointer-transparent div is the same effect for the cost
 * of a compositor opacity change: no layout, no paint, no reflow of the column.
 *
 * Suppressed under reduced motion.
 */

const DIP_MS = 120
const LIFT_MS = 280

export function StationTransition() {
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const activeStation = useScroll((s) => s.activeStation)
  const first = useRef(true)
  const veil = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    if (first.current) {
      first.current = false
      return
    }

    const el = veil.current
    if (!el) return

    el.style.transitionDuration = `${DIP_MS}ms`
    el.style.opacity = '0.07'

    const out = window.setTimeout(() => {
      el.style.transitionDuration = `${LIFT_MS}ms`
      el.style.opacity = '0'
    }, DIP_MS)

    return () => {
      window.clearTimeout(out)
      el.style.opacity = '0'
    }
  }, [activeStation, reducedMotion])

  if (reducedMotion) return null

  return (
    <div
      ref={veil}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        pointerEvents: 'none',
        background: '#000',
        opacity: 0,
        transitionProperty: 'opacity',
        transitionTimingFunction: 'ease-out',
        transitionDuration: `${LIFT_MS}ms`,
        willChange: 'opacity',
      }}
    />
  )
}
