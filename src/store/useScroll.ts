'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { StationId } from '@/engine/types'
import { STATION_RANGES, resolveStation } from '@/lib/curves'
import { clamp, damp } from '@/lib/math'

/**
 * THE HOT PATH.
 *
 * `scrollState` is a plain mutable object rewritten every frame. Anything running
 * inside `useFrame` reads from here — `scrollState.progress`, never
 * `useScroll(s => s.progress)`. Subscribing a React component to a value that
 * changes 60 times a second re-renders it 60 times a second.
 *
 * The zustand store below carries the same values for components that genuinely need
 * to re-render, but it is only written when something moved enough to matter.
 */
export const scrollState = {
  progress: 0,
  velocity: 0,
  direction: 1 as 1 | -1,
  activeStation: 'hero' as StationId,
  localProgress: 0,
  /** raw pixels, for anything that needs absolute offsets */
  scroll: 0,
  limit: 1,
}

export type ScrollState = typeof scrollState

interface ScrollStore {
  progress: number
  velocity: number
  direction: 1 | -1
  activeStation: StationId
  localProgress: number
  /** true once Lenis is running */
  ready: boolean
  scrollTo: (station: StationId, opts?: { immediate?: boolean }) => void
}

let lenis: Lenis | null = null
let gsapWired = false

export const useScroll = create<ScrollStore>(() => ({
  progress: 0,
  velocity: 0,
  direction: 1,
  activeStation: 'hero',
  localProgress: 0,
  ready: false,

  scrollTo: (station, opts) => {
    if (!lenis) return
    const [start] = STATION_RANGES[station]
    // Aim a little past the station edge so its reveals have already triggered.
    const target = (start + Math.min(0.02, (STATION_RANGES[station][1] - start) * 0.2)) * lenisLimit()
    lenis.scrollTo(target, {
      duration: opts?.immediate ? 0 : 1.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    })
  },
}))

const lenisLimit = (): number => {
  if (!lenis) return 1
  const limit = (lenis as unknown as { limit: number }).limit
  return limit > 0 ? limit : 1
}

/** Pause and resume scrolling — used by the preloader and the mobile menu. */
export const lockScroll = (): void => lenis?.stop()
export const unlockScroll = (): void => lenis?.start()
export const getLenis = (): Lenis | null => lenis

/**
 * Boots Lenis and drives it from GSAP's ticker so ScrollTrigger and Lenis agree on
 * what "now" is. Mount exactly once, at the top of the page.
 */
export const useScrollController = (reducedMotion: boolean): void => {
  useEffect(() => {
    if (!gsapWired) {
      gsap.registerPlugin(ScrollTrigger)
      gsapWired = true
    }

    const instance = new Lenis({
      lerp: reducedMotion ? 1 : 0.085,
      wheelMultiplier: 1,
      smoothWheel: !reducedMotion,
      touchMultiplier: 1.6,
      infinite: false,
    })
    lenis = instance

    const onScroll = () => ScrollTrigger.update()
    instance.on('scroll', onScroll)

    // One clock for Lenis, GSAP and ScrollTrigger.
    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // --- per-frame state derivation -----------------------------------------
    let lastTime = performance.now()
    let lastStoreProgress = -1
    let lastStation: StationId | null = null
    let dampedVelocity = 0

    const update = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      const limit = lenisLimit()
      const scroll = instance.scroll
      const progress = clamp(scroll / limit, 0, 1)

      // Lenis reports velocity in px/frame. ~40px/frame is a brisk flick.
      const rawVelocity = clamp(instance.velocity / 40, -1, 1)
      dampedVelocity = damp(dampedVelocity, rawVelocity, 8, dt)

      const { id, local } = resolveStation(progress)

      scrollState.progress = progress
      scrollState.velocity = dampedVelocity
      scrollState.direction = rawVelocity < -0.001 ? -1 : 1
      scrollState.activeStation = id
      scrollState.localProgress = local
      scrollState.scroll = scroll
      scrollState.limit = limit

      // Only wake React when it would actually see a difference.
      const stationChanged = id !== lastStation
      const moved = Math.abs(progress - lastStoreProgress) > 0.0008
      if (stationChanged || moved) {
        lastStoreProgress = progress
        lastStation = id
        useScroll.setState({
          progress,
          velocity: dampedVelocity,
          direction: scrollState.direction,
          activeStation: id,
          localProgress: local,
        })
      }
    }

    gsap.ticker.add(update)
    useScroll.setState({ ready: true })

    if (process.env.NODE_ENV === 'development') {
      // Lets a headless browser drive the real scroll instead of fighting Lenis
      // with window.scrollTo, which Lenis would immediately undo.
      ;(window as unknown as { __lenis: Lenis }).__lenis = instance
    }

    const onResize = () => instance.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(raf)
      gsap.ticker.remove(update)
      instance.off('scroll', onScroll)
      instance.destroy()
      lenis = null
      useScroll.setState({ ready: false })
    }
  }, [reducedMotion])
}
