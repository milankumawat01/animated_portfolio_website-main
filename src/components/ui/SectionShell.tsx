'use client'

import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { useScroll } from '@/store/useScroll'
import { STATION_RANGES, stationVh } from '@/lib/curves'
import { cn } from '@/lib/cn'
import type { StationId } from '@/engine/types'

/**
 * The wrapper every station uses. It does three jobs:
 *
 *  1. Locks DOM height to the station's share of scroll, so the page you scroll and
 *     the camera path stay the same length by construction.
 *  2. Provides local progress to everything inside, so a station's reveals subscribe
 *     once here rather than eight times individually.
 *  3. Carries the landmark and data attributes the nav, tests and a11y pass rely on.
 *
 * Progress is quantized to 2% steps. That caps re-renders at ~50 per station instead
 * of 60 a second, which matters because this context feeds the whole DOM subtree.
 * Anything needing true per-frame precision reads `scrollState` in a useFrame.
 */

const StationContext = createContext<{ id: StationId; progress: number } | null>(null)

export const useStation = () => {
  const ctx = useContext(StationContext)
  if (!ctx) {
    throw new Error('useStation must be used inside a <SectionShell>')
  }
  return ctx
}

/**
 * Local progress 0..1 within the enclosing station, in 2% steps.
 * Returns 1 outside a station, so a component like `Footer` that can legitimately
 * render on its own shows its content rather than staying invisible forever.
 */
export const useStationProgress = (): number => useContext(StationContext)?.progress ?? 1

const QUANT = 50

export interface SectionShellProps {
  id: StationId
  theme: 'dark' | 'light'
  children: ReactNode
  className?: string
  /** vertical alignment of the content block within the tall section */
  align?: 'center' | 'start'
  /** set false for stations that lay out their own full-bleed grid */
  contained?: boolean
}

export function SectionShell({
  id,
  theme,
  children,
  className,
  align = 'center',
  contained = true,
}: SectionShellProps) {
  const progress = useScroll(
    useCallback(
      (s: { progress: number }) => {
        const [a, b] = STATION_RANGES[id]
        const raw = b > a ? (s.progress - a) / (b - a) : 0
        const clamped = raw < 0 ? 0 : raw > 1 ? 1 : raw
        return Math.round(clamped * QUANT) / QUANT
      },
      [id],
    ),
  )

  return (
    <StationContext.Provider value={{ id, progress }}>
      <section
        id={id}
        data-station={id}
        data-station-theme={theme}
        aria-labelledby={`${id}-heading`}
        className={cn('theme-fade relative w-full', className)}
        style={{ minHeight: `${stationVh(id)}vh` }}
      >
        <div
          className={cn(
            'sticky top-0 flex min-h-screen w-full',
            align === 'center' ? 'items-center' : 'items-start pt-28',
          )}
        >
          {contained ? (
            <div
              className="mx-auto w-full"
              style={{ maxWidth: 'var(--content-max)', padding: '0 var(--gutter)' }}
            >
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </section>
    </StationContext.Provider>
  )
}
