'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { navItems, profile } from '@/data/profile'
import { copy } from '@/data/copy'
import { useScroll } from '@/store/useScroll'
import { EASE } from '@/lib/math'
import type { StationId } from '@/engine/types'
import { Monogram } from '../ui/primitives'
import { cn } from '@/lib/cn'

/**
 * Fixed above everything. The active link tracks the camera, not the URL — there is
 * only one page, so `activeStation` from the scroll store is the source of truth.
 *
 * The underdot is a shared layoutId, so it slides between links rather than
 * reappearing, which is the whole reason it reads as "the camera is here".
 */

const MOBILE_BREAKPOINT = 900

export function Nav() {
  const activeStation = useScroll((s) => s.activeStation)
  const scrollTo = useScroll((s) => s.scrollTo)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(
    () => useScroll.subscribe((s) => setScrolled(s.progress > 0.01)),
    [],
  )

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const go = (station: string) => {
    setMenuOpen(false)
    scrollTo(station as StationId)
  }

  // `activeStation` can be a station with no nav link (experience, skills, build).
  // Highlight the nearest preceding link instead of nothing.
  const NAV_STATIONS = navItems.map((n) => n.station)
  const ORDER: string[] = [
    'hero',
    'about',
    'projects',
    'experience',
    'skills',
    'build',
    'writing',
    'contact',
  ]
  const activeIndex = ORDER.indexOf(activeStation)
  let activeLink = NAV_STATIONS[0]
  for (const s of NAV_STATIONS) {
    if (ORDER.indexOf(s) <= activeIndex) activeLink = s
  }

  return (
    <>
      <header
        className="theme-fade fixed inset-x-0 top-0 z-50"
        style={{
          transition: 'background-color 300ms ease, border-color 300ms ease',
          background: scrolled ? 'var(--card-blur-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px) saturate(140%)' : undefined,
          WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(140%)' : undefined,
          borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        }}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex items-center justify-between"
          style={{
            maxWidth: 'var(--content-max)',
            padding: '0 var(--gutter)',
            height: 72,
          }}
        >
          <button
            type="button"
            onClick={() => go('hero')}
            className="flex items-center gap-2.5"
            aria-label={`${profile.name} — back to top`}
          >
            <Monogram size={26} color="var(--brand)" />
            <span
              className="hidden sm:inline"
              style={{
                fontFamily: 'var(--font-display), sans-serif',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                fontSize: '0.9375rem',
                color: 'var(--fg)',
              }}
            >
              {profile.name}
            </span>
          </button>

          {!isMobile ? (
            <ul className="flex list-none items-center gap-1 p-0" style={{ margin: 0 }}>
              {navItems.map((item) => {
                const active = item.station === activeLink
                return (
                  <li key={item.station} className="relative">
                    <button
                      type="button"
                      onClick={() => go(item.station)}
                      aria-current={active ? 'true' : undefined}
                      className="relative px-3.5 py-2 text-[0.875rem] font-medium transition-colors duration-200"
                      style={{ color: active ? 'var(--fg)' : 'var(--fg-muted)' }}
                    >
                      {item.label}
                    </button>
                    {active ? (
                      <motion.span
                        layoutId="nav-underdot"
                        aria-hidden
                        className="absolute left-1/2 rounded-full"
                        style={{
                          bottom: 0,
                          width: 4,
                          height: 4,
                          x: '-50%',
                          background: 'var(--brand)',
                        }}
                        transition={{ duration: 0.4, ease: EASE.out }}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : null}

          <div className="flex items-center gap-2">
            {!isMobile ? (
              <button
                type="button"
                onClick={() => go('contact')}
                className="group inline-flex items-center gap-2 font-medium transition-transform duration-200 active:scale-[0.97]"
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--r-pill)',
                  fontSize: '0.875rem',
                  background: 'var(--brand)',
                  color: 'var(--on-brand)',
                }}
              >
                {copy.contact.cta}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="grid place-items-center"
                style={{ width: 44, height: 44, color: 'var(--fg)' }}
              >
                <span className="relative block" style={{ width: 20, height: 12 }}>
                  <span
                    aria-hidden
                    className="absolute left-0 block transition-transform duration-300"
                    style={{
                      top: menuOpen ? 5 : 0,
                      width: 20,
                      height: 1.5,
                      background: 'currentColor',
                      transform: menuOpen ? 'rotate(45deg)' : 'none',
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute left-0 block transition-transform duration-300"
                    style={{
                      top: menuOpen ? 5 : 10,
                      width: 20,
                      height: 1.5,
                      background: 'currentColor',
                      transform: menuOpen ? 'rotate(-45deg)' : 'none',
                    }}
                  />
                </span>
              </button>
            )}
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-center"
            style={{ background: 'var(--bg)', padding: 'var(--gutter)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE.out }}
          >
            <ul className="flex list-none flex-col gap-2 p-0" style={{ margin: 0 }}>
              {navItems.map((item, i) => (
                <motion.li
                  key={item.station}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.4, ease: EASE.out }}
                >
                  <button
                    type="button"
                    onClick={() => go(item.station)}
                    className={cn('t-display-lg block w-full text-left')}
                    style={{
                      color: item.station === activeLink ? 'var(--brand)' : 'var(--fg)',
                    }}
                  >
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
