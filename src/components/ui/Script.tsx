'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE } from '@/lib/math'
import { useQuality } from '@/store/useQuality'
import { useStationProgress } from './SectionShell'
import { REVEAL_THRESHOLD } from './Reveal'
import { cn } from '@/lib/cn'

/**
 * The handwritten annotations. These appear on every station and carry a lot of the
 * personality, so the underline matters: it is an inline SVG swoosh drawn on with
 * stroke-dashoffset over 900ms, 200ms after the text arrives.
 *
 *   <Script rotate={-6} underline>Good Ideas Lead to Great Things.</Script>
 */

const SWOOSH = 'M3 12 C 40 3, 118 3, 176 9 C 210 12, 240 16, 262 12'

export interface ScriptProps {
  children: ReactNode
  /** degrees */
  rotate?: number
  underline?: boolean
  className?: string
  delay?: number
  at?: number
  style?: React.CSSProperties
}

export function Script({
  children,
  rotate = 0,
  underline = false,
  className,
  delay = 0,
  at = REVEAL_THRESHOLD,
  style,
}: ScriptProps) {
  const progress = useStationProgress()
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const shown = progress >= at

  return (
    <motion.span
      className={cn('t-script relative inline-block', className)}
      style={{ rotate: reducedMotion ? 0 : rotate, ...style }}
      /* Same keys in both variants — see the note in Reveal.tsx. */
      initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: reducedMotion ? 0 : 10 }}
      transition={{ duration: reducedMotion ? 0.3 : 0.62, ease: EASE.out, delay: shown ? delay : 0 }}
    >
      {children}
      {underline ? (
        <svg
          aria-hidden
          viewBox="0 0 266 20"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 w-full"
          style={{ top: '100%', height: 12, overflow: 'visible' }}
        >
          <motion.path
            d={SWOOSH}
            fill="none"
            stroke="var(--brand)"
            strokeWidth={2.4}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: shown ? 0 : 1 }}
            transition={{
              duration: reducedMotion ? 0.01 : 0.9,
              ease: EASE.out,
              delay: shown ? delay + 0.2 : 0,
            }}
          />
        </svg>
      ) : null}
    </motion.span>
  )
}
