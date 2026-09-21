'use client'

import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { lockScroll, unlockScroll } from '@/store/useScroll'

/**
 * Holds scroll until the world is ready, then wipes away.
 *
 * `useProgress` only reports on things that actually went through a THREE loader, so
 * a page whose stations are all procedural sits at 0/0 forever — the gate below
 * treats "nothing is loading and nothing has loaded" as done.
 *
 * It deliberately does NOT wait for the first WebGL frame. See MAX_FRAME_WAIT_MS.
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

/** Subscribe to the first rendered WebGL frame. */
export const useFirstFrame = (): boolean => {
  const [seen, setSeen] = useState(firstFrameSeen)
  useEffect(() => {
    if (firstFrameSeen) {
      setSeen(true)
      return
    }
    const fn = () => setSeen(true)
    firstFrameListeners.add(fn)
    return () => {
      firstFrameListeners.delete(fn)
    }
  }, [])
  return seen
}

const MIN_VISIBLE_MS = 700
/**
 * How long the panel will wait for the first WebGL frame before giving up on it.
 *
 * It used to wait indefinitely (4s bail), which made Largest Contentful Paint a
 * function of GPU initialisation: the hero headline could not reveal until the
 * panel lifted, and the panel would not lift until three.js had compiled its first
 * frame. Measured at 7.7s LCP on a throttled run.
 *
 * The DOM is the content and it is ready long before the world is. So the panel now
 * leaves on the content's schedule, and the canvas fades itself in when it is ready
 * — a beat later, which reads as the world arriving rather than as a wait.
 */
const MAX_FRAME_WAIT_MS = 450
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
    if (ready || !assetsDone) return
    const waited = performance.now() - mountedAt.current
    // Hold a short grace for the first frame so the common (fast) case still hands
    // over to a painted world — but never let it gate the handover.
    const graceLeft = frameReady ? 0 : Math.max(0, MAX_FRAME_WAIT_MS - waited)
    const delay = Math.max(graceLeft, MIN_VISIBLE_MS - waited, 0)
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
      data-preloader=""
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
