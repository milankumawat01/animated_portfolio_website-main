# P2 — Design System & DOM Kit

**Mode:** solo, blocking · **Depends on:** P1 · **Est:** 5h

Build every shared DOM component the eight station agents will assemble from. If a
station agent has to invent a component, this phase failed.

---

## Files you own

```
src/app/globals.css
src/components/ui/Button.tsx  Card.tsx  Chip.tsx  Eyebrow.tsx  Script.tsx
                  Quote.tsx  IconTile.tsx  ArrowLink.tsx  StatBlock.tsx
                  CarouselNav.tsx  SectionShell.tsx  Reveal.tsx  CodeBlock.tsx
                  TechLogo.tsx  index.ts
src/components/chrome/Nav.tsx  Footer.tsx  ScrollHint.tsx  index.ts
src/lib/cn.ts
```

---

## Tasks

### 1. `globals.css`
- All tokens from `docs/01-DESIGN-SYSTEM.md` §1 as custom properties on `:root`.
- A `[data-theme="dark"]` block that remaps the semantic aliases (`--fg`, `--fg-muted`,
  `--bg`, `--card-bg`, `--border`) to the night palette. **Components reference only
  the semantic aliases**, never `--ink-900` directly — that is what makes the whole
  DOM recolour when the director flips the theme.
- Tailwind v4 `@theme` block mapping tokens to utilities.
- `body { background: var(--page-bg); }` — the director animates that variable.
- Type scale as utility classes (`.t-display-xl` etc.) from §2.
- A 300ms `color`/`background-color`/`border-color` transition on the theme-aware
  elements so the flip reads as a fade, not a jump. Exclude it under reduced motion.

### 2. `SectionShell`
The wrapper every station uses:
```tsx
<SectionShell id="projects" theme="light">   // theme from the manifest
  {children}
</SectionShell>
```
- Height `calc(var(--station-vh) * 1vh)` where the value comes from the station's
  scroll share, so DOM height and 3D scroll ranges stay locked together. Read the
  share from `STATION_RANGES` — do not hardcode.
- `data-station` attribute, a `<section aria-labelledby>` landmark, the standard
  horizontal padding and max width.
- Provides a context with `localProgress` from `useScroll` so children can drive
  reveals without each subscribing separately.

### 3. `Reveal`
The one entrance primitive. `<Reveal delay={0.06} as="h2">`. Implements the pattern
from `docs/01-DESIGN-SYSTEM.md` §4: `y: 24 → 0`, `opacity: 0 → 1`, `blur(6px) → 0`,
`EASE.out`, 620ms, triggered on `localProgress > 0.08`. A `words` prop switches to
per-word staggered reveal for headlines. Respects reduced motion (opacity only).

### 4. The component set
Build every component in `docs/01-DESIGN-SYSTEM.md` §3 to spec. Notes:

- **`Script`** — the handwritten annotations. Caveat, a `rotate` prop, and an optional
  `underline` prop that renders an inline SVG swoosh drawn on with `stroke-dasharray`
  + `stroke-dashoffset` over 900ms. These annotations appear on every station and are
  a big part of the personality — get them right.
- **`Headline`** (part of `Reveal` or its own) — takes a string with `[brackets]` and
  renders the bracketed span in `--brand-500`. This enforces the headline rule
  mechanically so no station can break it.
- **`TechLogo`** — resolves a name to a `simple-icons` SVG path, renders at a given
  size with the brand colour or monochrome. Handles the gap-list fallbacks from P0.
- **`CodeBlock`** — macOS-style window chrome with three dots and a filename, JetBrains
  Mono body, a `typewriter` prop that types the content out when the station activates.
  Used once, in P3F.
- **`Card`** — `blur` prop toggles the backdrop-filter variant. Default is opaque.

### 5. `Nav` and `Footer`
- `Nav`: fixed, monogram + wordmark left, five links centre, `Let's Talk` CTA right.
  Active link tracks `activeStation` with an animated underdot. Scrolled state adds a
  blurred background. Clicking a link calls `scrollTo(station)`. Mobile: a full-screen
  overlay menu.
- `Footer`: renders inside the Contact station's shell, not as a sibling — it is part
  of station 08's DOM. Export it; P3H places it.

---

## Acceptance criteria

- [ ] Every component in §3 of the design system exists, is exported from
      `components/ui/index.ts`, and is typed
- [ ] Flipping `data-theme` on `<html>` in DevTools recolours the entire DOM correctly
- [ ] A scratch page rendering every component at every variant looks like the mockups
      — build it, screenshot it, then delete it
- [ ] `Reveal` triggers on scroll and is opacity-only under reduced motion
- [ ] `Script` underline draws on
- [ ] Nav active state follows the camera through all eight stations
- [ ] No component imports from `src/scenes/**`
- [ ] `pnpm build` clean

---

## Assets

`monogram.svg` (A1) for Nav 🟡 — stub with a text "MK" lockup if absent.
