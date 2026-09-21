'use client'

import { useEffect, useRef } from 'react'
import { useScroll } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'

/**
 * A 120ms brightness dip and a 2px vertical nudge on the DOM overlay as the camera
 * crosses a station boundary.
 *
 * It sells "arrival" without an interstitial. It has to stay this small: anything
 * more and it becomes a page transition, which is exactly the thing a single
 * continuous scroll is supposed to avoid.
 *
 * Suppressed under reduced motion.
 */
export function StationTransition() {
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const activeStation = useScroll((s) => s.activeStation)
  const first = useRef(true)

  useEffect(() => {
    if (reducedMotion) return
    if (first.current) {
      first.current = false
      return
    }

    const main = document.getElementById('content')
    if (!main) return

    main.style.transition = 'filter 120ms ease-out, transform 120ms ease-out'
    main.style.filter = 'brightness(0.94)'
    main.style.transform = 'translate3d(0, 2px, 0)'

    const out = window.setTimeout(() => {
      main.style.transition = 'filter 280ms ease-out, transform 280ms ease-out'
      main.style.filter = ''
      main.style.transform = ''
    }, 120)

    const clean = window.setTimeout(() => {
      main.style.transition = ''
    }, 440)

    return () => {
      window.clearTimeout(out)
      window.clearTimeout(clean)
      main.style.transition = ''
      main.style.filter = ''
      main.style.transform = ''
    }
  }, [activeStation, reducedMotion])

  return null
}
