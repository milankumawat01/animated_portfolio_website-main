'use client'

import { type ElementType, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE } from '@/lib/math'
import { useQuality } from '@/store/useQuality'
import { useStationProgress } from './SectionShell'
import { cn } from '@/lib/cn'

/**
 * The one entrance primitive. Every station uses this and nothing else — that
 * consistency is what makes the site feel authored rather than assembled.
 *
 * y: 24 → 0, opacity: 0 → 1, blur(6px) → 0, 620ms on EASE.out, fired once the
 * enclosing station passes 8% local progress. Under reduced motion it is opacity
 * only, with no blur and no translation.
 */

/** Local progress at which a station's content starts arriving. */
export const REVEAL_THRESHOLD = 0.08

export interface RevealProps {
  children: ReactNode
  /** seconds */
  delay?: number
  as?: ElementType
  className?: string
  /** split the string child into per-word staggered reveals — for headlines */
  words?: boolean
  /** override the trigger point, e.g. for content further down a tall station */
  at?: number
  style?: React.CSSProperties
  id?: string
}

const DURATION = 0.62
const WORD_DURATION = 0.78
const WORD_STAGGER = 0.045

export function Reveal({
  children,
  delay = 0,
  as = 'div',
  className,
  words = false,
  at = REVEAL_THRESHOLD,
  style,
  id,
}: RevealProps) {
  const progress = useStationProgress()
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const shown = progress >= at

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  const hidden = reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 24, filter: 'blur(6px)' }
  const visible = reducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: 'blur(0px)' }

  if (words && typeof children === 'string') {
    const parts = children.split(' ')
    return (
      <MotionTag id={id} className={className} style={style} aria-label={children}>
        {parts.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              aria-hidden
              className="inline-block"
              initial={hidden}
              animate={shown ? visible : hidden}
              transition={{
                duration: reducedMotion ? 0.3 : WORD_DURATION,
                ease: EASE.out,
                delay: shown ? delay + i * WORD_STAGGER : 0,
              }}
            >
              {word}
              {i < parts.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      id={id}
      className={cn(className)}
      style={style}
      initial={hidden}
      animate={shown ? visible : hidden}
      transition={{
        duration: reducedMotion ? 0.3 : DURATION,
        ease: EASE.out,
        delay: shown ? delay : 0,
      }}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Staggers its direct children through the standard 60ms card cadence, so a station
 * never has to compute per-item delays by hand.
 */
export function RevealGroup({
  children,
  delay = 0,
  stagger = 0.06,
  className,
  at = REVEAL_THRESHOLD,
}: {
  children: ReactNode[]
  delay?: number
  stagger?: number
  className?: string
  at?: number
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={delay + i * stagger} at={at}>
          {child}
        </Reveal>
      ))}
    </div>
  )
}
