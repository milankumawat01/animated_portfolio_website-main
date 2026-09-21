'use client'

import { FocusScroll } from './FocusScroll'
import { SkipLink } from './SkipLink'
import { StationNav } from './StationNav'
import { StaticBackdrop } from './StaticBackdrop'

/**
 * Everything P6 mounts, in one place, at the top of `<body>`.
 *
 * It lives in `app/layout.tsx` rather than `app/page.tsx` for two reasons. The skip
 * link and the station nav have to be the first two stops in the tab order, and
 * `layout` is the only file that can put something before the page's own content.
 * And `app/page.tsx` is P1's and frozen — putting this in the layout means P6 needs
 * no change to a file it does not own. Every component here is inert on a route
 * that has no Lenis and no canvas, so `/fallback` gets the skip link and nothing
 * that would misbehave.
 *
 * The `<noscript>` block is not decoration. Motion's initial styles are
 * server-rendered, so with scripting off every reveal ships as
 * `opacity: 0; filter: blur(6px)` and never animates — the copy is in the HTML (and
 * therefore indexed) but a human sees a blank page behind the loading overlay. The
 * rules below undo exactly those two things and nothing else.
 */

/**
 * The skip link and the station nav reveal themselves with CSS, not with React
 * state. Both have to work the instant the HTML lands — before hydration, and on a
 * page where hydration failed — because they are the two controls a keyboard user
 * reaches first. `:focus` and `:focus-within` need a stylesheet; there is no inline
 * equivalent.
 */
const A11Y_CSS = `
  [data-skip-link]:focus,
  [data-skip-link]:focus-visible { transform: translateY(0) !important; }

  [data-station-nav]:focus-within { transform: translateY(0) !important; }

  @media (prefers-reduced-motion: reduce) {
    [data-skip-link], [data-station-nav] { transition: none !important; }
  }
`

const NOSCRIPT_CSS = `
  /* The preloader never resolves without scripting. */
  body > [role="status"][aria-live="polite"] { display: none !important; }

  /* Motion's SSR'd "before" state, unblocked. */
  main [style*="blur(6px)"],
  main [style*="opacity:0;"],
  main [style$="opacity:0"],
  header [style*="blur(6px)"] {
    opacity: 1 !important;
    filter: none !important;
    transform: none !important;
  }

  /* Nothing is pinned when nothing scrolls it. */
  main section > div[class*="sticky"] { position: static !important; }
  main section { min-height: 0 !important; }
`

export function A11yLayer() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: A11Y_CSS }} />
      <SkipLink />
      <StationNav />
      <FocusScroll />
      <StaticBackdrop />
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
      </noscript>
    </>
  )
}
