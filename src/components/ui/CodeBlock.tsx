'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuality } from '@/store/useQuality'
import { useStationProgress } from './SectionShell'
import { cn } from '@/lib/cn'

/**
 * macOS-style window chrome around a mono block. Used once, in How I Build.
 *
 * `typewriter` types the content out when the station activates. Under reduced
 * motion the full text is present immediately — and it is always present in the
 * DOM for screen readers, with the animated copy marked aria-hidden.
 */

const CHARS_PER_SECOND = 90

export interface CodeBlockProps {
  code: string
  filename: string
  typewriter?: boolean
  at?: number
  className?: string
  badge?: string
}

export function CodeBlock({
  code,
  filename,
  typewriter = false,
  at = 0.12,
  className,
  badge,
}: CodeBlockProps) {
  const progress = useStationProgress()
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const active = progress >= at
  const [shownChars, setShownChars] = useState(typewriter && !reducedMotion ? 0 : code.length)
  const raf = useRef(0)

  /**
   * Once it has typed out, it stays typed out. Without this the effect restarts from
   * zero every time `active` goes false → true, so scrolling away and back retyped
   * the whole block — which reads as a glitch, not an effect.
   */
  const done = useRef(false)

  useEffect(() => {
    if (!typewriter || reducedMotion) {
      setShownChars(code.length)
      done.current = true
      return
    }
    if (!active || done.current) return

    const start = performance.now()
    const tick = (t: number) => {
      const n = Math.min(code.length, Math.floor(((t - start) / 1000) * CHARS_PER_SECOND))
      setShownChars(n)
      if (n < code.length) raf.current = requestAnimationFrame(tick)
      else done.current = true
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active, typewriter, reducedMotion, code])

  const typing = shownChars < code.length

  return (
    <div
      className={cn('theme-fade relative overflow-hidden', className)}
      style={{
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)',
        background: 'var(--night-800)',
        boxShadow: 'var(--shadow-lift)',
      }}
    >
      <div
        className="flex items-center gap-2 px-4"
        style={{
          height: 42,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <span
            key={c}
            aria-hidden
            style={{ width: 11, height: 11, borderRadius: 999, background: c }}
          />
        ))}
        <span
          className="t-meta ml-3"
          style={{ color: 'var(--night-mut)', fontFamily: 'var(--font-mono), monospace' }}
        >
          {filename}
        </span>
      </div>

      <pre
        aria-hidden
        className="t-code m-0 overflow-x-auto p-5"
        style={{ color: '#CFE0F5', minHeight: '11.5em' }}
      >
        <code>
          {code.slice(0, shownChars)}
          {typing ? (
            <span
              className="inline-block align-middle"
              style={{
                width: 8,
                height: '1em',
                marginLeft: 1,
                background: 'var(--brand-400)',
                animation: 'none',
              }}
            />
          ) : null}
        </code>
      </pre>

      {/* The real, complete text for assistive tech. */}
      <pre className="sr-only">{code}</pre>

      {badge ? (
        <div
          className="t-meta absolute"
          style={{
            right: 14,
            bottom: 12,
            padding: '6px 12px',
            borderRadius: 'var(--r-pill)',
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--night-mut)',
          }}
        >
          {badge}
        </div>
      ) : null}
    </div>
  )
}
