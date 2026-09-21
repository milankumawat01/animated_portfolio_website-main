'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getLenis, useScroll } from '@/store/useScroll'
import { STATION_FRAGMENTS } from '@/lib/seo'
import type { StationId } from '@/engine/types'
import { beginProgrammaticFocus } from './FocusScroll'
import { VisuallyHidden } from './VisuallyHidden'

/**
 * The complete keyboard route through the site.
 *
 * The primary nav in `components/chrome/Nav.tsx` is a *design* element: five links,
 * because that is what the mockups show. Experience, Skills and How I Build have no
 * link of their own, so a keyboard-only or screen-reader visitor has no way to reach
 * three of the eight stations except by tabbing through everything in front of them.
 *
 * This is the functional counterpart. All eight stations, second in the tab order
 * after the skip link, off screen until something inside it takes focus and then a
 * real panel with the same tokens as the rest of the site. Nothing is duplicated
 * visually and nothing is missing functionally.
 *
 * It also owns the one live region on the page: as the camera crosses a boundary the
 * station name is announced, so somebody who cannot see the scene still knows where
 * the document has moved to. Polite, and only on a real change.
 */

export function StationNav() {
  const activeStation = useScroll((s) => s.activeStation)
  const [announced, setAnnounced] = useState('')

  // Announce the station, not every scroll tick. `activeStation` only changes on a
  // boundary crossing, so this fires eight times across the whole page at most.
  // The first render is skipped: arriving on a page is not a navigation event.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const entry = STATION_FRAGMENTS.find((s) => s.id === activeStation)
    if (entry) setAnnounced(`${entry.title}. Section ${STATION_FRAGMENTS.indexOf(entry) + 1} of 8.`)
  }, [activeStation])

  const go = useCallback((id: StationId) => {
    if (getLenis()) {
      useScroll.getState().scrollTo(id)
    } else {
      // No Lenis on this route (the static /fallback page). Native scroll is
      // correct there, and it is the only thing that works.
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    }

    /**
     * Move focus to the destination heading, or the jump is silent: the page moves
     * and the screen reader's cursor stays in the nav. `beginProgrammaticFocus`
     * stops `FocusScroll` treating this as a focus that needs a scroll of its own —
     * we have already asked Lenis for exactly the scroll we want.
     */
    const heading = document.getElementById(`${id}-heading`)
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
      beginProgrammaticFocus()
      heading.focus({ preventScroll: true })
    }
  }, [])

  // Escape leaves the panel and returns focus to the document, matching the mobile
  // menu's behaviour so Escape means the same thing everywhere on the site.
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return
    e.stopPropagation()
    const main = document.getElementById('content')
    if (main) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
      beginProgrammaticFocus()
      main.focus({ preventScroll: true })
    }
  }, [])

  return (
    <>
      <div
        data-station-nav
        onKeyDown={onKeyDown}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 299,
          // Off screen, not hidden — it must keep its slot in the tab order. The
          // reveal is `:focus-within` in A11Y_CSS, so it works before hydration.
          transform: 'translateY(calc(-100% - 220px))',
          transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          padding: 12,
          width: 248,
          borderRadius: 'var(--r-lg)',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          boxShadow: 'var(--shadow-lift)',
        }}
      >
        <nav aria-label="Sections">
          <p
            className="t-eyebrow"
            style={{ margin: '2px 0 8px 8px', color: 'var(--fg-muted)' }}
          >
            Jump to section
          </p>
          <ol
            role="list"
            className="m-0 flex list-none flex-col p-0"
            style={{ gap: 2 }}
          >
            {STATION_FRAGMENTS.map((s, i) => {
              const current = s.id === activeStation
              return (
                <li key={s.id} role="listitem">
                  <button
                    type="button"
                    onClick={() => go(s.id as StationId)}
                    aria-current={current ? 'true' : undefined}
                    className="flex w-full items-center gap-3 text-left"
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--r-sm)',
                      fontSize: '0.875rem',
                      fontWeight: current ? 600 : 500,
                      color: current ? 'var(--brand)' : 'var(--fg)',
                      background: current ? 'var(--brand-soft)' : 'transparent',
                    }}
                  >
                    <span
                      aria-hidden
                      className="tabular-nums"
                      style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.title}
                    {current ? <VisuallyHidden>(current section)</VisuallyHidden> : null}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <VisuallyHidden as="div" role="status" aria-live="polite" aria-atomic>
        {announced}
      </VisuallyHidden>
    </>
  )
}
