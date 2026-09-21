'use client'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { motion } from 'motion/react'
import { EASE } from '@/lib/math'
import { cn } from '@/lib/cn'

/**
 * The small, shared surface pieces: Card, Chip, IconTile, ArrowLink, Button, Quote,
 * StatBlock, CarouselNav. All spec'd in docs/01-DESIGN-SYSTEM.md §3.
 *
 * Every one of these reads only the semantic tokens (--fg, --card-bg, --border…),
 * never the raw palette, so they all recolour when the director flips data-theme.
 */

// ---------------------------------------------------------------- Card

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Frosted variant, for the two stations where the 3D must read through the card.
   * Expensive — the design system caps the page at three of these at once.
   */
  blur?: boolean
  interactive?: boolean
}

export function Card({
  blur = false,
  interactive = false,
  className,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'theme-fade relative',
        interactive && 'transition-[transform,box-shadow] duration-200',
        className,
      )}
      {...rest}
      /**
       * `style` is destructured out of `rest` and applied AFTER the spread. The
       * earlier version merged it into the defaults and then spread `rest`, so the
       * spread clobbered the whole style object and any card given a `style` prop
       * silently lost its background, radius, border and shadow.
       */
      style={{
        background: blur ? 'var(--card-blur-bg)' : 'var(--card-bg)',
        backdropFilter: blur ? 'blur(20px) saturate(140%)' : undefined,
        WebkitBackdropFilter: blur ? 'blur(20px) saturate(140%)' : undefined,
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
        ...style,
      }}
    />
  )
}

// ---------------------------------------------------------------- Chip

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn('t-meta inline-flex items-center whitespace-nowrap', className)}
      style={{
        background: 'var(--card-sunk)',
        borderRadius: 'var(--r-sm)',
        padding: '8px 14px',
        lineHeight: 1,
        color: 'var(--fg-strong)',
      }}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------- IconTile

export function IconTile({
  children,
  size = 44,
  className,
}: {
  children: ReactNode
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center', className)}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--r-md)',
        background: 'var(--brand-soft)',
        color: 'var(--brand)',
      }}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------- ArrowLink

export function ArrowLink({
  children,
  href,
  className,
  external = false,
  ...rest
}: {
  children: ReactNode
  href: string
  className?: string
  external?: boolean
} & Omit<ComponentPropsWithoutRef<'a'>, 'href'>) {
  return (
    <a
      href={href}
      className={cn('group inline-flex items-center gap-2 font-medium', className)}
      style={{ color: 'var(--brand)', fontSize: '0.9375rem' }}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : null)}
      {...rest}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-200 group-hover:translate-x-1"
      >
        →
      </span>
    </a>
  )
}

// ---------------------------------------------------------------- Button

export interface ButtonProps extends ComponentPropsWithoutRef<'a'> {
  variant?: 'primary' | 'ghost'
  icon?: ReactNode
  href: string
}

export function Button({
  variant = 'primary',
  icon,
  children,
  className,
  href,
  ...rest
}: ButtonProps) {
  const primary = variant === 'primary'
  return (
    <a
      href={href}
      className={cn(
        'group inline-flex items-center justify-center gap-2 font-medium',
        'transition-[transform,background-color,border-color,box-shadow] duration-200',
        'active:scale-[0.97]',
        className,
      )}
      style={{
        padding: '14px 28px',
        borderRadius: 'var(--r-pill)',
        fontSize: '0.9375rem',
        background: primary ? 'var(--brand)' : 'transparent',
        color: primary ? 'var(--on-brand)' : 'var(--fg)',
        border: primary ? '1px solid var(--brand)' : '1px solid var(--border)',
        boxShadow: primary ? '0 8px 24px rgba(37, 99, 235, 0.24)' : 'none',
      }}
      {...rest}
    >
      {children}
      {icon ? (
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
          {icon}
        </span>
      ) : null}
    </a>
  )
}

// ---------------------------------------------------------------- Quote

export function Quote({
  children,
  by,
  className,
}: {
  children: ReactNode
  by: string
  className?: string
}) {
  return (
    <figure className={cn('relative', className)}>
      <span
        aria-hidden
        className="absolute select-none leading-none"
        style={{
          top: -14,
          left: -6,
          fontSize: 72,
          fontFamily: 'var(--font-display), serif',
          color: 'var(--brand)',
          opacity: 0.22,
        }}
      >
        &ldquo;
      </span>
      <blockquote
        className="relative t-body-lg italic"
        style={{ paddingLeft: 26, color: 'var(--fg-strong)' }}
      >
        {children}
      </blockquote>
      <figcaption className="t-meta mt-3" style={{ paddingLeft: 26 }}>
        — {by}
      </figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------- StatBlock

export interface Stat {
  readonly value: string
  readonly label: string
}

export function StatBlock({ stats, className }: { stats: readonly Stat[]; className?: string }) {
  return (
    <dl className={cn('flex flex-wrap items-stretch', className)}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="flex flex-col gap-1"
          style={{
            paddingLeft: i === 0 ? 0 : 'clamp(20px, 3vw, 40px)',
            paddingRight: 'clamp(20px, 3vw, 40px)',
            borderLeft: i === 0 ? 'none' : '1px solid var(--border)',
          }}
        >
          <dt className="sr-only">{s.label}</dt>
          <dd
            className="m-0"
            style={{
              fontFamily: 'var(--font-display), sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.6rem, 2.6vw, 2.25rem)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: 'var(--fg)',
            }}
          >
            {s.value}
          </dd>
          <span className="t-meta">{s.label}</span>
        </div>
      ))}
    </dl>
  )
}

// ---------------------------------------------------------------- CarouselNav

export function CarouselNav({
  onPrev,
  onNext,
  disabledPrev = false,
  disabledNext = false,
  label = 'carousel',
  className,
}: {
  onPrev: () => void
  onNext: () => void
  disabledPrev?: boolean
  disabledNext?: boolean
  label?: string
  className?: string
}) {
  const base =
    'grid place-items-center rounded-full transition-[transform,background-color,opacity] duration-200 active:scale-95 disabled:opacity-35 disabled:pointer-events-none'
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={disabledPrev}
        aria-label={`Previous ${label}`}
        className={base}
        style={{
          width: 52,
          height: 52,
          border: '1px solid var(--border)',
          color: 'var(--fg)',
          background: 'transparent',
        }}
      >
        <span aria-hidden>←</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabledNext}
        aria-label={`Next ${label}`}
        className={base}
        style={{
          width: 52,
          height: 52,
          background: 'var(--brand)',
          color: 'var(--on-brand)',
          border: '1px solid var(--brand)',
        }}
      >
        <span aria-hidden>→</span>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------- Monogram

/** The MK lockup. Matches public/monogram.svg, which the hero particles sample. */
export function Monogram({
  size = 28,
  color = 'currentColor',
  className,
  animated = false,
}: {
  size?: number
  color?: string
  className?: string
  animated?: boolean
}) {
  const paths = [
    'M56 372 L56 140 L92 140 L152 232 L212 140 L248 140 L248 372 L212 372 L212 200 L152 292 L92 200 L92 372 Z',
    'M272 140 L308 140 L308 238 L400 140 L448 140 L348 246 L456 372 L408 372 L322 270 L308 286 L308 372 L272 372 Z',
  ]
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-hidden
      className={className}
      style={{ overflow: 'visible' }}
    >
      {paths.map((d, i) =>
        animated ? (
          <motion.path
            key={i}
            d={d}
            fill={color}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE.out, delay: i * 0.08 }}
          />
        ) : (
          <path key={i} d={d} fill={color} />
        ),
      )}
    </svg>
  )
}
