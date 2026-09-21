'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * `— 03  PROJECTS`
 * A 40px blue rule, then the bold blue number, then the tracked uppercase label.
 */
export function Eyebrow({
  n,
  children,
  className,
}: {
  n?: string
  children: ReactNode
  className?: string
}) {
  return (
    <p className={cn('flex items-center gap-3', className)}>
      <span
        aria-hidden
        className="inline-block h-px shrink-0"
        style={{ width: 40, background: 'var(--brand)' }}
      />
      {n ? (
        <span
          className="t-eyebrow"
          style={{ color: 'var(--brand)', fontWeight: 700, letterSpacing: '0.1em' }}
        >
          {n}
        </span>
      ) : null}
      <span className="t-eyebrow">{children}</span>
    </p>
  )
}
