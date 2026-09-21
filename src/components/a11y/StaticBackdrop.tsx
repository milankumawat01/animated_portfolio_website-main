'use client'

import { useEffect, useRef } from 'react'
import { useQuality } from '@/store/useQuality'
import { scrollState, useScroll } from '@/store/useScroll'
import { lerpHex, smoothstep } from '@/lib/math'

/**
 * WHAT THE SITE LOOKS LIKE WITH NO WEBGL.
 *
 * `engine/Canvas.tsx` returns null when `hasWebGL` is false, which leaves eight
 * fully-rendered DOM stations — and two things that were the canvas's job go with
 * it. `SceneDirector` is the only thing that writes `--page-bg` and flips
 * `data-theme` on `<html>`, so without it the whole page stays locked at the hero's
 * near-black and every light station renders in dark tokens. The result reads as
 * something broken rather than something designed.
 *
 * So this is not a warning banner and not a screenshot of the 3D. It is the same
 * composition, authored in CSS: the same eight environments, the same centre-to-
 * centre cross-fade `SceneDirector` uses, and one gradient field per station that
 * stands in for what the camera would have been looking at. A visitor on a
 * locked-down laptop gets a portfolio with light and dark movements, not a remainder.
 *
 * Mounted for every visitor; it renders nothing at all when WebGL is available.
 */

interface Backdrop {
  id: string
  /** must match the station manifest's `environment.background` */
  bg: string
  theme: 'dark' | 'light'
  /** CSS layers, painted over `bg`, standing in for that station's scene */
  image: string
}

/**
 * Backgrounds and themes are copied from each station's `manifest.ts`. They are
 * restated rather than imported because importing a manifest pulls three.js and
 * eight scene graphs into a code path whose entire purpose is running without them.
 * If a manifest's `environment.background` changes, change it here too.
 */
const BACKDROPS: readonly Backdrop[] = [
  {
    // 01 hero — the particle monogram, right of the headline column.
    id: 'hero',
    bg: '#05080E',
    theme: 'dark',
    image: [
      'radial-gradient(52vw 62vh at 76% 46%, rgba(59,130,246,0.22), transparent 68%)',
      'radial-gradient(30vw 34vh at 78% 44%, rgba(147,197,253,0.16), transparent 70%)',
      'radial-gradient(90vw 70vh at 10% 110%, rgba(29,78,216,0.16), transparent 72%)',
    ].join(','),
  },
  {
    // 02 about — the desk under a warm lamp, lower left.
    id: 'about',
    bg: '#F5F8FC',
    theme: 'light',
    image: [
      'radial-gradient(44vw 52vh at 22% 82%, rgba(245,165,36,0.16), transparent 70%)',
      'radial-gradient(52vw 60vh at 74% 24%, rgba(37,99,235,0.10), transparent 72%)',
    ].join(','),
  },
  {
    // 03 projects — four glass slabs on a shallow arc.
    id: 'projects',
    bg: '#F5F8FC',
    theme: 'light',
    image: [
      'linear-gradient(104deg, transparent 12%, rgba(37,99,235,0.09) 15%, rgba(255,255,255,0.65) 22%, transparent 25%)',
      'linear-gradient(100deg, transparent 33%, rgba(37,99,235,0.10) 36%, rgba(255,255,255,0.7) 44%, transparent 47%)',
      'linear-gradient(96deg, transparent 55%, rgba(37,99,235,0.10) 58%, rgba(255,255,255,0.7) 66%, transparent 69%)',
      'linear-gradient(92deg, transparent 77%, rgba(37,99,235,0.09) 80%, rgba(255,255,255,0.65) 87%, transparent 90%)',
      'radial-gradient(70vw 50vh at 50% 62%, rgba(37,99,235,0.08), transparent 72%)',
    ].join(','),
  },
  {
    // 04 experience — a helix of light climbing out of frame.
    id: 'experience',
    bg: '#F5F8FC',
    theme: 'light',
    image: [
      'radial-gradient(18vw 96vh at 72% 50%, rgba(37,99,235,0.15), transparent 72%)',
      'radial-gradient(26vw 22vh at 72% 14%, rgba(96,165,250,0.22), transparent 70%)',
      'radial-gradient(60vw 40vh at 30% 96%, rgba(37,99,235,0.07), transparent 74%)',
    ].join(','),
  },
  {
    // 05 skills — a constellation of linked nodes.
    id: 'skills',
    bg: '#F5F8FC',
    theme: 'light',
    image: [
      'radial-gradient(2.5px 2.5px at 18% 28%, rgba(37,99,235,0.42), transparent 60%)',
      'radial-gradient(2px 2px at 34% 62%, rgba(37,99,235,0.34), transparent 60%)',
      'radial-gradient(3px 3px at 58% 34%, rgba(37,99,235,0.40), transparent 60%)',
      'radial-gradient(2px 2px at 71% 71%, rgba(37,99,235,0.32), transparent 60%)',
      'radial-gradient(2.5px 2.5px at 84% 42%, rgba(37,99,235,0.36), transparent 60%)',
      'radial-gradient(2px 2px at 46% 84%, rgba(37,99,235,0.30), transparent 60%)',
      'radial-gradient(58vw 58vh at 56% 50%, rgba(37,99,235,0.10), transparent 72%)',
    ].join(','),
  },
  {
    // 06 build — the blueprint grid.
    id: 'build',
    bg: '#F2F6FC',
    theme: 'light',
    image: [
      'radial-gradient(68vw 62vh at 50% 58%, rgba(37,99,235,0.10), transparent 70%)',
      'repeating-linear-gradient(0deg, rgba(37,99,235,0.07) 0 1px, transparent 1px 64px)',
      'repeating-linear-gradient(90deg, rgba(37,99,235,0.07) 0 1px, transparent 1px 64px)',
    ].join(','),
  },
  {
    // 07 writing — sheets of paper falling toward the lens.
    id: 'writing',
    bg: '#EDF3FB',
    theme: 'light',
    image: [
      'linear-gradient(-16deg, transparent 18%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.85) 32%, transparent 34%)',
      'linear-gradient(-9deg, transparent 44%, rgba(255,255,255,0.7) 46%, rgba(255,255,255,0.7) 58%, transparent 60%)',
      'linear-gradient(-22deg, transparent 68%, rgba(255,255,255,0.6) 70%, rgba(255,255,255,0.6) 80%, transparent 82%)',
      'radial-gradient(70vw 60vh at 50% 40%, rgba(37,99,235,0.07), transparent 74%)',
    ].join(','),
  },
  {
    // 08 contact — the desk lamp again, and the monogram reassembling.
    id: 'contact',
    bg: '#05080E',
    theme: 'dark',
    image: [
      'radial-gradient(46vw 58vh at 18% 8%, rgba(245,165,36,0.18), transparent 66%)',
      'radial-gradient(56vw 62vh at 74% 62%, rgba(59,130,246,0.18), transparent 70%)',
      'radial-gradient(40vw 40vh at 50% 108%, rgba(29,78,216,0.16), transparent 72%)',
    ].join(','),
  },
]

/**
 * Station ranges, restated for the same reason as the backgrounds — `lib/curves`
 * imports three. These are the frozen ranges from `docs/02-ARCHITECTURE.md` §3.
 */
const RANGES: readonly [number, number][] = [
  [0.0, 0.11],
  [0.11, 0.23],
  [0.23, 0.4],
  [0.4, 0.55],
  [0.55, 0.68],
  [0.68, 0.8],
  [0.8, 0.91],
  [0.91, 1.0],
]

const CENTRES = RANGES.map(([a, b]) => (a + b) / 2)

export function StaticBackdrop() {
  const ready = useQuality((s) => s.ready)
  const hasWebGL = useQuality((s) => s.hasWebGL)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!ready || hasWebGL) return

    const root = document.documentElement
    let lastTheme = ''
    let lastBg = ''
    let raf = 0

    /**
     * The same centre-to-centre blend `SceneDirector` runs, so a build with WebGL
     * and a build without it cross-fade at exactly the same scroll positions.
     */
    const paint = () => {
      const p = scrollState.progress

      let i = 0
      while (i < CENTRES.length - 1 && p > CENTRES[i + 1]) i++
      const j = Math.min(i + 1, BACKDROPS.length - 1)
      const t = p <= CENTRES[0] ? 0 : smoothstep(CENTRES[i], CENTRES[j], p)

      for (let k = 0; k < BACKDROPS.length; k++) {
        const el = layerRefs.current[k]
        if (!el) continue
        const opacity = k === i ? 1 - t : k === j ? t : 0
        el.style.opacity = String(opacity)
      }

      const bg = lerpHex(BACKDROPS[i].bg, BACKDROPS[j].bg, t)
      if (bg !== lastBg) {
        lastBg = bg
        root.style.setProperty('--page-bg', bg)
      }

      const theme = t < 0.5 ? BACKDROPS[i].theme : BACKDROPS[j].theme
      if (theme !== lastTheme) {
        lastTheme = theme
        root.setAttribute('data-theme', theme)
      }
    }

    // Lenis drives `scrollState` from GSAP's ticker; a store subscription only
    // fires when progress moved enough to matter, which is exactly the cadence a
    // cross-fade needs. rAF covers the very first paint before any scroll happens.
    paint()
    raf = requestAnimationFrame(paint)
    const unsubscribe = useScroll.subscribe(paint)
    window.addEventListener('resize', paint)

    return () => {
      cancelAnimationFrame(raf)
      unsubscribe()
      window.removeEventListener('resize', paint)
    }
  }, [ready, hasWebGL])

  if (!ready || hasWebGL) return null

  return (
    <div
      aria-hidden
      data-static-backdrop
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      {BACKDROPS.map((b, i) => (
        <div
          key={b.id}
          ref={(el) => {
            layerRefs.current[i] = el
          }}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === 0 ? 1 : 0,
            backgroundColor: b.bg,
            backgroundImage: b.image,
          }}
        />
      ))}
    </div>
  )
}
