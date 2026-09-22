# P5 — Dark / Light Theme

| | |
|---|---|
| **Wave** | 4 |
| **Depends on** | P4A, P4B, P4C — all pages must exist before they are themed |
| **Runs with** | **nothing.** This phase touches ~20 files. |

## Goal

A visitor-controlled dark/light theme across the whole public site, remembered between
visits.

**This is not "add a dark mode".** Read `05-DESIGN-SYSTEM.md` before forming a plan:
`HeroSection.tsx`, `Footer.tsx` and `app/not-found.tsx` are **already dark by design**, so
they need *light* variants invented, while everything else needs dark ones. It is a two-way
pass, and the light variants for those three are genuine design decisions, not mechanical
substitutions.

## Files owned

Effectively the whole public component layer:

- `apps/web/components/**` — every component
- `apps/web/app/globals.css`, `apps/web/tailwind.config.js`, `apps/web/app/layout.tsx`
- a new `ThemeProvider` and the Navbar toggle

## Read first

1. `docs/05-DESIGN-SYSTEM.md` — **the component-by-component migration table is this phase's
   checklist.** Work through it row by row.
2. `docs/02-DATA-MODEL.md` — the `experience.logoBg` wart, below

## Steps

1. `darkMode: 'class'` in Tailwind, `next-themes` with `attribute="class"`, an inline
   no-flash script in the root layout, `prefers-color-scheme` as the default with an explicit
   user choice persisted over it.
2. **Complete the token set first.** Every semantic token needs a value in *both* themes
   before any component is touched. Theming components against a half-finished palette means
   doing it twice.
3. Work the migration table. Per component: replace raw `bg-white` / `text-slate-900` /
   `bg-slate-50` with semantic tokens that resolve in both themes.
4. **The three already-dark components need real design thought.** `Footer.tsx` alone has
   ~47 raw color classes including hardcoded hex (`bg-[#070A0F]`, `bg-[#101622]`,
   `bg-[#131926]`). A dark footer on a light page is a deliberate choice today — decide
   whether it stays dark in light mode (a dark band) or inverts, and write the decision in
   `STATUS.md` before implementing it.
5. The toggle goes in the Navbar, which already has dual-state scroll logic to sit beside.
6. **Resolve the `logoBg` wart.** `experience.logoBg` stores raw Tailwind classes
   (`"bg-slate-900 text-white"`) in the database, and those will not respond to the theme.
   Pick an option from `05-DESIGN-SYSTEM.md`, implement it, and update `02-DATA-MODEL.md` in
   the same commit if the stored shape changes.
7. Check every surface: all eight home sections, both modals that survive, `/projects`,
   `/projects/[slug]`, `/blog`, `/blog/[slug]`, 404, the custom cursor, the handwriting
   annotations, `TechBadge` (which already has a `dark` variant prop), focus rings and
   selection colors.

## Acceptance criteria

- [ ] Toggling switches the entire site, with no element left on the wrong palette
- [ ] **No flash of the wrong theme on first paint** — hard-reload in both modes, twice
- [ ] The choice persists across reloads and survives a new tab
- [ ] With no stored choice, `prefers-color-scheme` is respected
- [ ] Every route themes correctly — home, projects index and detail, blog index and post,
      404
- [ ] Every modal themes correctly
- [ ] No raw `bg-white`, `bg-slate-*` or `text-slate-*` survives in `components/**` —
      verified by grep, not by memory
- [ ] Text contrast meets WCAG AA in both themes, including the muted/secondary text and the
      handwriting annotations
- [ ] Focus rings are visible in both themes
- [ ] **Layout is unchanged in both themes** — colors only. No spacing, no markup, no
      component structure
- [ ] `npm run build` passes; `npx tsc --noEmit` passes

## Gotcha

The temptation to refactor while touching 20 files is enormous. Resist it. Colors only.
Anything else belongs in its own commit with its own justification.

## Commit

`feat(p5): dark and light theme across the public site`
