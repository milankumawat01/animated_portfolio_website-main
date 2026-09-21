'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import type { QualityTier } from '@/engine/types'
import { DPR_CAP, demote, detectProfile, hasTierOverride } from '@/engine/quality'

interface QualityState {
  tier: QualityTier
  reducedMotion: boolean
  hasWebGL: boolean
  dpr: number
  /** false until detection has run on the client */
  ready: boolean
  renderer: string
  isTouch: boolean
  setTier: (t: QualityTier) => void
  hydrate: () => void
}

export const useQuality = create<QualityState>((set, get) => ({
  // SSR-safe defaults. `hydrate()` replaces them on mount.
  tier: 'high',
  reducedMotion: false,
  hasWebGL: true,
  dpr: 1,
  ready: false,
  renderer: '',
  isTouch: false,

  setTier: (tier) => {
    if (get().tier === tier) return
    set({ tier, dpr: Math.min(window.devicePixelRatio || 1, DPR_CAP[tier]) })
  },

  hydrate: () => {
    if (get().ready) return
    const p = detectProfile()
    set({
      tier: p.tier,
      reducedMotion: p.reducedMotion,
      hasWebGL: p.hasWebGL,
      dpr: p.dpr,
      renderer: p.renderer,
      isTouch: p.isTouch,
      ready: true,
    })
  },
}))

/**
 * Runs detection, then a 3-second FPS probe that can demote the tier once.
 * Mount exactly once, above the canvas.
 */
export const useQualityProbe = (): void => {
  useEffect(() => {
    useQuality.getState().hydrate()

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => useQuality.setState({ reducedMotion: mq.matches })
    mq.addEventListener('change', onMotionChange)

    let raf = 0
    let frames = 0
    let start = 0
    let stopped = hasTierOverride()

    const tick = (t: number) => {
      if (!start) start = t
      frames++
      const elapsed = t - start

      // Ignore the first 800ms — mount, compile and upload cost is not steady state.
      if (elapsed > 3000) {
        const fps = (frames / elapsed) * 1000
        const { tier, setTier } = useQuality.getState()
        if (fps < 34 && tier !== 'low') setTier(demote(tier))
        return
      }
      if (elapsed < 800) {
        frames = 0
        start = t
      }
      raf = requestAnimationFrame(tick)
    }

    if (!stopped) raf = requestAnimationFrame(tick)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      mq.removeEventListener('change', onMotionChange)
    }
  }, [])
}
