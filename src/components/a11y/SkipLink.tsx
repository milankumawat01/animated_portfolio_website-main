'use client'

import { useCallback } from 'react'
import { getLenis } from '@/store/useScroll'
import { beginProgrammaticFocus } from './FocusScroll'

/**
 * The first thing in the tab order, invisible until it has focus.
 *
 * `href="#content"` alone would do two wrong things on this site: the browser's own
 * fragment navigation jumps the scroll position out from under Lenis, and `<main>`
 * is not focusable, so focus would stay on the link and the next Tab would land back
 * in the nav. So the click is handled: Lenis takes the page to the top, and focus is
 * moved onto `<main>` explicitly with `preventScroll`.
 *
 * The reveal is CSS (`:focus`, in `A11Y_CSS`), not a React `onFocus`. A skip link
 * that only appears once React has hydrated is a skip link that is missing exactly
 * when someone on a slow connection needs it most.
 */
export function SkipLink() {
  const onActivate = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    const main = document.getElementById('content')
    if (!main) return
    e.preventDefault()

    // <main> has no tabindex of its own; give it a programmatic one so focus can
    // land there and the next Tab continues from the top of the content.
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')

    beginProgrammaticFocus()
    main.focus({ preventScroll: true })

    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 0.8, force: true })
    else window.scrollTo({ top: 0 })
  }, [])

  return (
    <a
      href="#content"
      onClick={onActivate}
      data-skip-link
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 300,
        // Off-screen rather than hidden, so it keeps its place in the tab order.
        transform: 'translateY(calc(-100% - 24px))',
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '12px 20px',
        borderRadius: 'var(--r-pill)',
        background: 'var(--brand-600)',
        color: '#ffffff',
        fontSize: '0.875rem',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(10, 18, 32, 0.28)',
      }}
    >
      Skip to main content
    </a>
  )
}
