'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuality } from '@/store/useQuality'
import { demote, hasTierOverride } from './quality'

/**
 * Continuous frame-rate watchdog. Demotes one tier, once, when the site is
 * genuinely too slow — and never promotes.
 *
 * This is the *steady-state* counterpart to `useQualityProbe` in
 * `store/useQuality.ts`, which is a one-shot startup probe over the first three
 * seconds. They do not overlap: this one stays disarmed until `ARM_DELAY_MS`,
 * which is past the point where the startup probe has already made its call.
 *
 * ## Why it never promotes
 *
 * Promotion is a trap. The scene that made the frame rate recover is usually the
 * cheap one you just scrolled into, so promoting there means the next expensive
 * station arrives at the tier that was already too slow — and the visitor gets a
 * sawtooth of quality changes instead of one honest decision. A tier that is one
 * step too conservative is invisible. Oscillation is not.
 *
 * ## The two things it refuses to do
 *
 * 1. **Fight a pinned tier.** `?q=low|medium|high` is an instruction, not a hint.
 *    `hasTierOverride()` disarms the whole monitor.
 * 2. **Trust a software rasteriser.** Headless Chrome here runs on SwiftShader and
 *    reports 0–5fps at every tier no matter what is on screen. That number is a
 *    measurement of a CPU rasteriser, not of this site, and demoting on it would
 *    make every automated run test a different build than the one that ships.
 *    The same applies to llvmpipe and to Chrome's generic "Software" renderer.
 */

/** Rolling window, in frames. ~1s at 60fps, ~2s at 30fps. */
const WINDOW = 60

/** Below this, the frame rate counts as bad. */
const FPS_FLOOR = 45

/** How long the average has to stay below the floor before we act. */
const SUSTAIN_MS = 2000

/**
 * Nothing is measured before this. Mount, shader compile and the first texture
 * uploads are not steady state, and the startup probe owns the first 3s anyway.
 */
const ARM_DELAY_MS = 4000

/**
 * A frame longer than this is a stall — a tab switch, a GC pause, a station
 * mounting its shaders — not a frame rate. Counting it would demote on a hiccup.
 */
const STALL_MS = 250

const TOAST_MS = 4200

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software|basic render|microsoft basic/i

const adaptiveDisabled = (): boolean => {
  if (typeof window === 'undefined') return true
  return new URLSearchParams(window.location.search).get('adaptive') === '0'
}

export function AdaptiveQuality() {
  const [toast, setToast] = useState<string | null>(null)
  const shown = useRef(false)

  useEffect(() => {
    if (hasTierOverride() || adaptiveDisabled()) return

    const { renderer } = useQuality.getState()
    if (renderer && SOFTWARE_RENDERER.test(renderer)) return

    let raf = 0
    let armAt = 0
    let last = 0
    /** Ring of frame durations, in ms. */
    const frames = new Float32Array(WINDOW)
    let filled = 0
    let cursor = 0
    let sum = 0
    /** When the rolling average first went below the floor, or 0. */
    let badSince = 0

    const reset = () => {
      filled = 0
      cursor = 0
      sum = 0
      badSince = 0
      last = 0
    }

    // A backgrounded tab throttles rAF to ~1fps. Measuring across that is noise.
    const onVisibility = () => reset()
    document.addEventListener('visibilitychange', onVisibility)

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)

      if (!armAt) armAt = t + ARM_DELAY_MS
      if (t < armAt) {
        last = t
        return
      }
      if (!last) {
        last = t
        return
      }

      const dt = t - last
      last = t
      if (dt > STALL_MS || dt <= 0) {
        reset()
        return
      }

      sum += dt - frames[cursor]
      frames[cursor] = dt
      cursor = (cursor + 1) % WINDOW
      if (filled < WINDOW) {
        filled++
        return
      }

      const fps = 1000 / (sum / WINDOW)
      if (fps >= FPS_FLOOR) {
        badSince = 0
        return
      }

      if (!badSince) {
        badSince = t
        return
      }
      if (t - badSince < SUSTAIN_MS) return

      const { tier, setTier } = useQuality.getState()
      if (tier === 'low') {
        // Nothing left to give. Stop burning a rAF slot on a decision we cannot make.
        cancelAnimationFrame(raf)
        raf = 0
        return
      }

      setTier(demote(tier))
      reset()

      if (!shown.current) {
        shown.current = true
        setToast('Reduced quality for smoother performance')
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(id)
  }, [toast])

  if (!toast) return null

  return (
    <div
      data-perf-toast=""
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 24,
        transform: 'translateX(-50%)',
        zIndex: 60,
        maxWidth: 'calc(100vw - 32px)',
        padding: '8px 14px',
        borderRadius: 999,
        background: 'rgba(5, 8, 14, 0.82)',
        color: 'rgba(232, 238, 247, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        backdropFilter: 'blur(10px)',
        font: '12px/1.4 ui-sans-serif, system-ui, -apple-system, sans-serif',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        pointerEvents: 'none',
        animation: 'none',
      }}
    >
      {toast}
    </div>
  )
}
