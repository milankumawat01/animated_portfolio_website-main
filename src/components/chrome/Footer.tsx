'use client'

import { footerNavItems, profile, socials } from '@/data/profile'
import { copy } from '@/data/copy'
import { useScroll } from '@/store/useScroll'
import type { StationId } from '@/engine/types'
import { Monogram } from '../ui/primitives'
import { Script } from '../ui/Script'
import { TechLogo } from '../ui/TechLogo'
import { Icon } from '../ui/Icon'
import { cn } from '@/lib/cn'

/**
 * The dark footer bar. It is part of station 08's DOM, not a sibling of <main> —
 * P3H places it inside the Contact shell so it scrolls with that station and the
 * camera is already at rest behind it.
 */

/**
 * GitHub and X come from simple-icons. LinkedIn does not — simple-icons dropped it
 * over trademark, so we use our own stroke glyph, same as for mail.
 */
const SIMPLE_ICON: Record<string, string> = { github: 'GitHub', x: 'X' }

export function Footer({ className }: { className?: string }) {
  const scrollTo = useScroll((s) => s.scrollTo)

  return (
    <footer
      /**
       * A <footer> scoped inside a sectioning element is not `contentinfo`, and this
       * one lives inside the Contact <section> by design so it scrolls with that
       * station. The explicit role gives screen-reader users the landmark back
       * without moving it out of the station.
       */
      role="contentinfo"
      className={cn('relative w-full', className)}
      style={{
        borderTop: '1px solid rgba(255,255,255,0.09)',
        paddingTop: 56,
        paddingBottom: 40,
        color: 'var(--night-mut)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Monogram size={30} color="var(--brand-400)" />
            <span
              style={{
                fontFamily: 'var(--font-display), sans-serif',
                fontWeight: 800,
                fontSize: '1.125rem',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: 'var(--night-fg)',
              }}
            >
              {profile.name}
            </span>
          </div>
          <p className="t-meta" style={{ color: 'var(--night-mut)' }}>
            {profile.role}
          </p>
        </div>

        <Script rotate={-4} className="mt-1" style={{ color: 'var(--night-fg)' }}>
          {copy.contact.scripts[1]}
        </Script>
      </div>

      <nav aria-label="Footer" className="mt-12">
        <ul role="list" className="flex list-none flex-wrap gap-x-8 gap-y-3 p-0" style={{ margin: 0 }}>
          {footerNavItems.map((item) => (
            <li key={item.station}>
              <button
                type="button"
                onClick={() => scrollTo(item.station as StationId)}
                className="text-[0.875rem] transition-colors duration-200"
                style={{ color: 'var(--night-mut)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--night-fg)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--night-mut)')}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="mt-10 flex flex-wrap items-end justify-between gap-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}
      >
        <ul role="list" className="flex list-none items-center gap-3 p-0" style={{ margin: 0 }}>
          {socials.map((s) => (
            <li key={s.id}>
              <a
                href={s.href}
                aria-label={s.label}
                target={s.id === 'mail' ? undefined : '_blank'}
                rel="noreferrer noopener"
                className="grid place-items-center transition-colors duration-200"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--night-mut)',
                }}
              >
                {SIMPLE_ICON[s.id] ? (
                  <TechLogo name={SIMPLE_ICON[s.id]} size={16} title={false} />
                ) : (
                  <Icon name={s.id === 'mail' ? 'mail' : 'linkedin'} size={17} />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-1.5 sm:text-right">
          <span className="t-meta" style={{ color: 'var(--night-mut)' }}>
            📍 {profile.location}
          </span>
          <span className="t-meta" style={{ color: 'var(--night-mut)', opacity: 0.75 }}>
            {profile.copyright}
          </span>
        </div>
      </div>
    </footer>
  )
}
