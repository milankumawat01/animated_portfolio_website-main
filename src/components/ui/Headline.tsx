'use client'

import { Fragment, type ElementType } from 'react'
import { motion } from 'motion/react'
import { EASE } from '@/lib/math'
import { useQuality } from '@/store/useQuality'
import { useStationProgress } from './SectionShell'
import { REVEAL_THRESHOLD } from './Reveal'
import { cn } from '@/lib/cn'

/**
 * THE HEADLINE RULE, enforced mechanically.
 *
 * Every section headline is two lines and the second half is brand blue. Passing
 * the copy through this component is the only way a station renders a headline, so
 * no station can break the rule by accident:
 *
 *   <Headline lines={['Turning ideas', 'into [real solutions.]']} />
 *
 * Bracketed spans render in --brand. Reveal is per word, 780ms, 45ms stagger,
 * continuing the count across both lines so line two does not restart the cadence.
 */

const WORD_DURATION = 0.78
const WORD_STAGGER = 0.045

const splitBrackets = (line: string): { text: string; brand: boolean }[] => {
  const out: { text: string; brand: boolean }[] = []
  const re = /\[([^\]]*)\]/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ text: line.slice(last, m.index), brand: false })
    out.push({ text: m[1], brand: true })
    last = m.index + m[0].length
  }
  if (last < line.length) out.push({ text: line.slice(last), brand: false })
  return out
}

export interface HeadlineProps {
  lines: readonly string[]
  as?: ElementType
  id?: string
  size?: 'xl' | 'lg'
  className?: string
  delay?: number
  at?: number
}

export function Headline({
  lines,
  as = 'h2',
  id,
  size = 'lg',
  className,
  delay = 0,
  at = REVEAL_THRESHOLD,
}: HeadlineProps) {
  const progress = useStationProgress()
  const reducedMotion = useQuality((s) => s.reducedMotion)
  const shown = progress >= at

  const Tag = as as React.ComponentType<React.HTMLAttributes<HTMLElement>>
  const plain = lines.map((l) => l.replace(/[[\]]/g, '')).join(' ')

  /**
   * Both variants must declare the SAME KEYS whether or not motion is reduced.
   * `reducedMotion` starts false and flips true once device detection runs, so a
   * variant that drops `filter` leaves the blur from the first render painted on
   * forever — the whole overlay renders permanently out of focus.
   */
  const hidden = reducedMotion
    ? { opacity: 0, y: 0, filter: 'blur(0px)' }
    : { opacity: 0, y: 28, filter: 'blur(6px)' }
  const visible = { opacity: 1, y: 0, filter: 'blur(0px)' }

  let wordIndex = 0

  return (
    <Tag
      id={id}
      aria-label={plain}
      className={cn(size === 'xl' ? 't-display-xl' : 't-display-lg', className)}
    >
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 ? <br aria-hidden /> : null}
          {splitBrackets(line).map((seg, si) => (
            <span
              key={si}
              aria-hidden
              style={seg.brand ? { color: 'var(--brand)' } : undefined}
            >
              {seg.text.split(' ').map((word, wi, arr) => {
                if (word === '') return null
                const i = wordIndex++
                return (
                  <span
                    key={wi}
                    className="inline-block overflow-hidden"
                    style={{ verticalAlign: 'bottom' }}
                  >
                    <motion.span
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
                      {wi < arr.length - 1 ? ' ' : ''}
                    </motion.span>
                  </span>
                )
              })}
            </span>
          ))}
        </Fragment>
      ))}
    </Tag>
  )
}
