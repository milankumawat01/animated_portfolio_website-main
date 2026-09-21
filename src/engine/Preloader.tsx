'use client'

import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { lockScroll, unlockScroll } from '@/store/useScroll'

/**
 * Holds scroll until the world is ready, then wipes away.
 *
 * `useProgress` only reports on things that actually went through a THREE loader, so
 * a page whose stations are all procedural sits at 0/0 forever. The gate below treats
 * "nothing is loading and nothing has loaded" as done once the first frame is on
 * screen, rather than waiting for a number that will never arrive.
 */

let firstFrameSeen = false
const firstFrameListeners = new Set<() => void>()

/** Called from inside the Canvas on the first rendered frame. */
export const notifyFirstFrame = (): void => {
  if (firstFrameSeen) return
  firstFrameSeen = true
  firstFrameListeners.forEach((fn) => fn())
  firstFrameListeners.clear()
}

const MIN_VISIBLE_MS = 700
const WIPE_MS = 600

/** The MK lockup, drawn on. Replaced by assets/incoming/monogram.svg when it lands. */
function Monogram({ draw }: { draw: number }) {
  const paths = ['M 4 21 L 4 3 L 13 14 L 22 3 L 22 21', 'M 30 3 L 30 21', 'M 41 3 L 30 12.5 L 42 21']
  return (
    <svg
      width="132"
      height="76"
      viewBox="0 0 46 24"
      fill="none"
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="#3B82F6"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
          style={{ transition: 'stroke-dashoffset 120ms linear' }}
        />
      ))}
    </svg>
  )
}

export function Preloader() {
  const { progress, active, loaded, total } = useProgress()
  const [ready, setReady] = useState(false)
  const [gone, setGone] = useState(false)
  const [frameReady, setFrameReady] = useState(firstFrameSeen)
  const mountedAt = useRef(0)

  useEffect(() => {
    mountedAt.current = performance.now()
    lockScroll()
    // Lenis may not exist yet when this mounts; lock again once it does.
    const retry = window.setTimeout(lockScroll, 60)
    return () => window.clearTimeout(retry)
  }, [])

  useEffect(() => {
    if (firstFrameSeen) {
      setFrameReady(true)
      return
    }
    const fn = () => setFrameReady(true)
    firstFrameListeners.add(fn)
    // If WebGL never starts, do not trap the user behind the panel.
    const bail = window.setTimeout(() => setFrameReady(true), 4000)
    return () => {
      firstFrameListeners.delete(fn)
      window.clearTimeout(bail)
    }
  }, [])

  const assetsDone = total === 0 ? !active : progress >= 100 && !active

  useEffect(() => {
    if (ready || !frameReady || !assetsDone) return
    const waited = performance.now() - mountedAt.current
    const delay = Math.max(0, MIN_VISIBLE_MS - waited)
    const id = window.setTimeout(() => setReady(true), delay)
    return () => window.clearTimeout(id)
  }, [ready, frameReady, assetsDone])

  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(() => {
      setGone(true)
      unlockScroll()
    }, WIPE_MS)
    return () => window.clearTimeout(id)
  }, [ready])

  if (gone) return null

  const shown = total > 0 ? Math.round(progress) : frameReady ? 100 : 82
  const draw = frameReady ? 1 : Math.max(0.12, shown / 100)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${shown} percent`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'grid',
        placeItems: 'center',
        gap: 28,
        background: '#05080E',
        transform: ready ? 'translateY(-101%)' : 'translateY(0)',
        transition: `transform ${WIPE_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        willChange: 'transform',
      }}
    >
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22 }}>
        <Monogram draw={draw} />
        <div
          style={{
            font: '500 12px/1 var(--font-mono, ui-monospace), ui-monospace, monospace',
            letterSpacing: '0.22em',
            color: '#8B9AAF',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {String(shown).padStart(3, '0')}
          <span style={{ opacity: 0.45 }}> / 100</span>
        </div>
        <div style={{ width: 132, height: 1, background: 'rgba(255,255,255,0.1)' }}>
          <div
            style={{
              width: `${shown}%`,
              height: '100%',
              background: '#2563EB',
              transition: 'width 220ms linear',
            }}
          />
        </div>
      </div>
      {loaded > 0 && total > 0 ? (
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
          {loaded} of {total} assets
        </span>
      ) : null}
    </div>
  )
}
