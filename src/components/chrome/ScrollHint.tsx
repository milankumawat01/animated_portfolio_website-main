'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useScroll } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'
import { copy } from '@/data/copy'
import { EASE } from '@/lib/math'

/**
 * The vertical SCROLL cue in the hero. Disappears for good once the reader has
 * clearly started — showing it again later would be nagging, not helping.
 */
export function ScrollHint() {
  const visible = useScroll((s) => s.progress < 0.02)
  const reducedMotion = useQuality((s) => s.reducedMotion)

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed z-30 flex flex-col items-center gap-3"
          style={{ right: 'clamp(16px, 3vw, 44px)', bottom: 40, color: 'var(--night-mut)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE.out }}
        >
          <span
            className="t-eyebrow"
            style={{ writingMode: 'vertical-rl', letterSpacing: '0.3em', color: 'inherit' }}
          >
            {copy.hero.scrollHint}
          </span>
          <span
            className="relative block overflow-hidden"
            style={{ width: 1, height: 56, background: 'currentColor', opacity: 0.25 }}
          >
            {!reducedMotion ? (
              <motion.span
                className="absolute inset-x-0 block"
                style={{ height: 22, background: 'var(--brand-400)' }}
                animate={{ y: [-22, 56] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : null}
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
