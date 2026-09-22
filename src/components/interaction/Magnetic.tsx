'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useQuality } from '@/store/useQuality'
import { damp } from '@/lib/math'

/**
 * Pulls its child toward the pointer when the pointer is close, and springs back.
 *
 * Keep `strength` low. Magnetism that is too strong stops reading as attraction and
 * starts reading as a bug — the element appears to dodge the cursor.
 *
 * Off on coarse pointers and under reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 90,
  className,
}: {
  children: ReactNode
  strength?: number
  /** px beyond the element's own box within which it starts to react */
  radius?: number
  className?: string
}) {
  const wrap = useRef<HTMLSpanElement>(null)
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const isTouch = useQuality((s) => s.isTouch)
  const enabled = !reducedMotion && !isTouch

  useEffect(() => {
    const el = wrap.current
    if (!el || !enabled) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let raf = 0
    let last = performance.now()
    /**
     * The pointer is recorded here and the geometry is resolved once per FRAME.
     *
     * `getBoundingClientRect` on an element the browser has not laid out since the
     * last mutation forces a synchronous layout, and doing it straight from
     * `pointermove` meant one forced layout per hardware report — while the page is
     * scrolling, and therefore while the layout is dirty every single time.
     */
    let pointer: { x: number; y: number } | null = null
    let inside = false

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY }
      inside = true
    }

    const onLeaveWindow = () => {
      pointer = null
      inside = false
      target.x = 0
      target.y = 0
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      if (inside && pointer) {
        const r = el.getBoundingClientRect()
        const dx = pointer.x - (r.left + r.width / 2)
        const dy = pointer.y - (r.top + r.height / 2)
        const reach = Math.max(r.width, r.height) / 2 + radius
        const dist = Math.hypot(dx, dy)
        if (dist > reach) {
          target.x = 0
          target.y = 0
          // Out of reach and nothing moved: stop reading layout until it does.
          inside = false
        } else {
          // Falls off toward the edge of reach, so there is no jump on entry.
          const falloff = 1 - dist / reach
          target.x = dx * strength * falloff
          target.y = dy * strength * falloff
        }
      }

      current.x = damp(current.x, target.x, 9, dt)
      current.y = damp(current.y, target.y, 9, dt)
      el.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeaveWindow)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeaveWindow)
      el.style.transform = ''
    }
  }, [enabled, strength, radius])

  return (
    <span ref={wrap} className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </span>
  )
}
