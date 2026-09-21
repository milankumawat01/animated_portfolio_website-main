# P6 — Accessibility, SEO & Fallbacks

**Mode:** parallel with P5 · **Depends on:** P4 · **Est:** 4h

The site must work — genuinely work, not degrade into apology — with no WebGL, no
mouse, no JavaScript-heavy motion, and for someone using a screen reader.

---

## Files you own

```
src/app/fallback/page.tsx
src/app/sitemap.ts  robots.ts  opengraph-image.tsx
src/components/a11y/SkipLink.tsx  StationNav.tsx  VisuallyHidden.tsx
src/lib/seo.ts
src/app/layout.tsx        (metadata block only — coordinate with P0's ownership)
```

---

## Tasks

### 1. The no-WebGL fallback
If `hasWebGL` is false, render a **complete, well-designed static version** of the
portfolio — not a warning. Same content, same design system, same components, with
static images or CSS gradients where the 3D was. It should look deliberate; a visitor
on a locked-down corporate laptop should not know they are missing anything.

Implementation: `app/page.tsx` already gates on `useQuality().hasWebGL`. Build the
static composition in `app/fallback/page.tsx` and render it in place of the canvas +
overlay. Reuse every `components/ui` primitive.

### 2. Semantic structure
- One `<h1>` (the hero name). Every station heading is an `<h2>`.
- Each station is a `<section aria-labelledby>` landmark.
- The canvas gets `role="img"` and an `aria-label` describing the current station's
  scene, updated as the camera moves. Add `aria-hidden` to purely decorative 3D.
- Lists are lists. The timeline is an `<ol>`. Tech tags are a `<ul>`.

### 3. Keyboard navigation
- `SkipLink` to main content, visible on focus.
- **`StationNav`** — a persistent, keyboard-reachable list of the eight stations.
  `Tab` to it, `Enter` to jump. Visually it can be the existing nav; functionally it
  must be complete without a pointer.
- Every interactive element has a visible focus ring using `--brand-500` at 2px
  offset. Test the entire page with the keyboard only, no mouse.
- `Escape` closes the mobile menu and returns focus to the trigger.

### 4. Focus and scroll interaction
This is the subtle one: when a user tabs to an element in a station that is off-screen,
the browser's native scroll-into-view will fight Lenis. Intercept `focusin`, call
`lenis.scrollTo` on the station instead, and prevent the native scroll. Get this right
or keyboard navigation will feel broken.

### 5. Reduced motion audit
Walk every station with `prefers-reduced-motion: reduce` forced on and confirm the
rules from `docs/01-DESIGN-SYSTEM.md` §4 hold. Camera-follows-scroll stays; everything
autonomous stops.

### 6. SEO
- Metadata from `docs/06-CONTENT.md` § Metadata. Open Graph and Twitter cards.
- `opengraph-image.tsx` — a generated 1200×630 card using the display font, the
  monogram, the name and the role. Do not screenshot the 3D; render it with `ImageResponse`.
- `sitemap.ts`, `robots.ts`.
- JSON-LD `Person` schema with `jobTitle`, `worksFor`, `sameAs` links, `knowsAbout`.
- Confirm the full text content is present in the server-rendered HTML — `curl` the
  page and read it. If the copy is not in the raw HTML, SEO has failed.

### 7. Colour contrast
Audit every text-on-background pair at both themes. `--ink-400` on `--surface-page` is
the most likely failure. Fix by darkening the token, not by special-casing components.

---

## Acceptance criteria

- [ ] Lighthouse: Accessibility ≥ 95, SEO 100, Best Practices ≥ 95
- [ ] The entire site is navigable and operable with the keyboard alone
- [ ] Tabbing to an off-screen element scrolls smoothly, without fighting Lenis
- [ ] Disabling WebGL in the browser yields a complete, good-looking portfolio
- [ ] `curl` on the deployed page returns all section copy in the HTML
- [ ] Screen reader pass (NVDA or VoiceOver) reads a coherent document top to bottom
- [ ] All text meets WCAG AA contrast in both themes
- [ ] Reduced motion verified on all eight stations
- [ ] OG image renders correctly in a social preview debugger

---

## Assets

- 🟡 A1 monogram for the OG image and favicon set.
- 🟡 Static fallback imagery: the fallback page can reuse A2 and A3. No new assets.
