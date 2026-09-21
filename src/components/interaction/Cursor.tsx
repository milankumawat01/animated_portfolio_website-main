'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuality } from '@/store/useQuality'
import { pointerState, useInteraction, type CursorVariant } from '@/store/useInteraction'
import { damp } from '@/lib/math'

/**
 * A 10px dot that chases the pointer closely and a 36px ring that lags behind it.
 * The lag between the two *is* the effect; matching their damping kills it.
 *
 * Intent is declared in markup, not wired per-component: any element carrying
 * `data-cursor="link|view|drag|hidden"` sets the variant while the pointer is over
 * it, and plain `<a>`/`<button>` default to `link`. That keeps every station free of
 * cursor logic.
 *
 * Disabled entirely on coarse pointers and under reduced motion, where a lagging
 * ring is either meaningless or actively unpleasant.
 */

const DOT_LAMBDA = 18
const RING_LAMBDA = 10

const RING_SIZE: Record<CursorVariant, number> = {
  default: 36,
  link: 56,
  view: 72,
  drag: 64,
  hidden: 0,
}

const readVariant = (el: Element | null): CursorVariant => {
  const target = el?.closest<HTMLElement>('[data-cursor], a, button, input, textarea')
  if (!target) return 'default'
  const declared = target.dataset.cursor as CursorVariant | undefined
  if (declared) return declared
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return 'hidden'
  return 'link'
}

export function Cursor() {
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const isTouch = useQuality((s) => s.isTouch)
  const ready = useQuality((s) => s.ready)
  const variant = useInteraction((s) => s.cursorVariant)
  const setCursorVariant = useInteraction((s) => s.setCursorVariant)

  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const enabled = ready && !reducedMotion && !isTouch

  useEffect(() => {
    if (!enabled) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const d = { ...target }
    const r = { ...target }
    let raf = 0
    let last = performance.now()

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      pointerState.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1)
      if (!visible) setVisible(true)
      setCursorVariant(readVariant(e.target as Element))
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      d.x = damp(d.x, target.x, DOT_LAMBDA, dt)
      d.y = damp(d.y, target.y, DOT_LAMBDA, dt)
      r.x = damp(r.x, target.x, RING_LAMBDA, dt)
      r.y = damp(r.y, target.y, RING_LAMBDA, dt)
      if (dot.current) dot.current.style.transform = `translate3d(${d.x}px, ${d.y}px, 0) translate(-50%, -50%)`
      if (ring.current) ring.current.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    document.documentElement.classList.add('has-custom-cursor')

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [enabled, setCursorVariant, visible])

  if (!enabled) return null

  const size = RING_SIZE[variant]
  const showDot = variant === 'default' || variant === 'drag'

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[300]">
      <div
        ref={ring}
        className="absolute left-0 top-0 grid place-items-center rounded-full"
        style={{
          width: size,
          height: size,
          border: '1px solid var(--brand)',
          background: variant === 'view' ? 'var(--brand)' : 'transparent',
          color: 'var(--on-brand)',
          opacity: visible && variant !== 'hidden' ? 1 : 0,
          transition:
            'width 220ms cubic-bezier(0.16,1,0.3,1), height 220ms cubic-bezier(0.16,1,0.3,1), opacity 180ms linear, background-color 180ms linear',
          willChange: 'transform',
          fontSize: 10,
          letterSpacing: '0.14em',
          fontWeight: 600,
        }}
      >
        {variant === 'view' ? 'VIEW' : null}
        {variant === 'drag' ? (
          <span style={{ color: 'var(--brand)', fontSize: 13 }}>↔</span>
        ) : null}
      </div>
      <div
        ref={dot}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: 10,
          height: 10,
          background: 'var(--brand)',
          opacity: visible && showDot ? 1 : 0,
          transition: 'opacity 180ms linear',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
