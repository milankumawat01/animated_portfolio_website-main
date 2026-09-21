'use client'

import { useQuality, useQualityProbe } from '@/store/useQuality'
import { useScrollController } from '@/store/useScroll'

/**
 * Boots device tiering and the Lenis/GSAP scroll clock. Renders nothing.
 * Mount exactly once, as the first child of the page.
 */
export function SiteRuntime() {
  useQualityProbe()
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const ready = useQuality((s) => s.ready)
  useScrollController(ready ? reducedMotion : false)
  return null
}
