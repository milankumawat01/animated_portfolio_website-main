# Design System — tokens and the two-way theme model

> **Owner: P5.** This file describes the token system as it exists today, the exact reason a
> theme cannot simply be switched on, and the contract P5 must leave behind. P5 changes
> **colour only** — never layout, spacing, markup or motion. `00-MASTER-PLAN.md §8` is
> explicit: the rendered page must be pixel-identical in light mode after P5.

Surveyed against commit `c753fe9` on 2026-09-22. Counts in §2 are reproducible — the method
is given there.

---

## 1. The token system as it exists

Two parallel definitions of the same palette: `tailwind.config.js → theme.extend` and
`:root` in `app/globals.css`.

### Colour

| Token | Tailwind class | Value | CSS variable |
|---|---|---|---|
| ink | `ink` | `#0B1220` | `--ink` |
| ink soft | `ink-soft` | `#172033` | `--ink-soft` |
| blue (brand) | `blue` | `#1677FF` | `--blue` |
| blue dark | `blue-dark` | `#0D5ED7` | `--blue-dark` |
| blue light | `blue-light` | `#EAF3FF` | `--blue-light` |
| blue ramp | `blue-50` … `blue-900` | `#F2F7FF` → `#002C8C` | *(not mirrored)* |
| page background | `bg-primary` | `#FFFFFF` | `--bg-primary` |
| soft background | `bg-soft` | `#F7F9FC` | `--bg-soft` |
| tinted background | `bg-blue-soft` | `#F2F7FF` | `--bg-blue-soft` |
| dark background | `bg-dark` | `#080B10` | `--bg-dark` |
| dark soft | `bg-dark-soft` | `#10151D` | `--bg-dark-soft` |
| body text | `text-primary` | `#0B1220` | `--text-primary` |
| secondary text | `text-secondary` | `#536078` | `--text-secondary` |
| muted text | `text-muted` | `#8993A5` | `--text-muted` |
| text on dark | `text-on-dark` | `#F7F9FC` | `--text-on-dark` |
| hairline | `border` | `#E4E9F1` | `--border` |
| hairline on dark | `border-dark` | `#27303C` | `--border-dark` |

Usage is `bg-bg-primary`, `text-text-secondary`, `border-border` — the Tailwind prefix plus
the token group name. It reads oddly and it is correct.

### Type

Four families, all loaded from Google Fonts, all reached through a CSS variable.

| Role | Family | Tailwind | Variable | Helper class |
|---|---|---|---|---|
| UI / body | Manrope 300–800 | `font-sans` | `--font-manrope` | — |
| Editorial | Instrument Serif | `font-serif` | `--font-instrument-serif` | `.font-editorial` |
| Annotation | Caveat 500–700 | `font-handwriting` | `--font-caveat` | `.font-handwriting` |
| Code | JetBrains Mono 400–600 | `font-mono` | `--font-mono` | `.font-mono-code` |

`.text-hero-fluid` (`clamp(64px, 8vw, 118px)` / `0.95` / `-0.055em`) is defined in
`globals.css` but nothing uses it — `HeroSection.tsx` writes the sizes inline.

### Radii, shadow, tracking

| Group | Tokens |
|---|---|
| `borderRadius` | `sm 8px` · `md 12px` · `lg 16px` · `xl 24px` (mirrored as `--radius-*`) |
| `boxShadow` | `soft 0 8px 30px rgba(11,18,32,.06)` · `card 0 16px 45px rgba(11,18,32,.08)` · `blue-glow 0 0 35px -5px rgba(22,119,255,.35)` |
| `letterSpacing` | `hero -0.055em` · `heading -0.045em` · `label 0.16em` |

`--shadow-soft` and `--shadow-card` are mirrored in CSS; `blue-glow` is not.

### Which definition is authoritative

**Today: `tailwind.config.js`.** Every component consumes Tailwind classes. The `:root`
variables are read by exactly four rules in `globals.css` (`body` colour and background, the
four `font-family` helpers) and nowhere else. The blue ramp and `blue-glow` exist only in
Tailwind; nothing exists only in CSS. The `:root` block is therefore a near-complete,
unenforced duplicate — change one and the other drifts silently.

**After P5: `:root` in `globals.css` is authoritative** and `tailwind.config.js` references
it. See §3. This is not tidiness — a class-based theme cannot work while the hex values live
in the Tailwind config, because `bg-bg-primary` would compile to one fixed colour.

---

## 2. The theme problem, measured

No `dark:` variant appears anywhere in the codebase. Count is zero:

```
grep -rohE '\bdark:[a-z-]+' app components | wc -l   →  0
```

The five string matches for `dark` are `--blue-dark`, `--bg-dark`, `--text-on-dark`,
`--border-dark` and the `dark` variant key in `TechBadge.tsx`. None of them is a Tailwind
dark-mode variant.

### Survey

`raw` counts colour utilities bound to a fixed palette entry (`bg-white`, `text-slate-400`,
`border-slate-200`, `bg-[#070A0F]`, …). `token` counts utilities resolving through a
semantic token (`bg-bg-primary`, `text-text-secondary`, `border-border`, `text-ink`).
Reproduce with the two greps in `§2 Method` below.

| File | Lines | raw | token | Literal hex | Verdict |
|---|---:|---:|---:|---:|---|
| `components/ExperienceSection.tsx` | 192 | 4 | 22 | 0 | token-driven |
| `components/WritingSection.tsx` | 171 | 5 | 17 | 0 | token-driven |
| `components/ProjectsSection.tsx` | 146 | 5 | 16 | 0 | token-driven |
| `components/ContactSection.tsx` | 174 | 9 | 10 | 1 | token-driven |
| `components/SkillsSection.tsx` | 177 | 10 | 11 | 0 | token-driven |
| `app/page.tsx` | 99 | 1 | 2 | 0 | token-driven |
| `components/ui/SectionHeader.tsx` | 61 | 3 | 3 | 0 | token-driven (dual-theme prop) |
| `components/ui/QuoteBox.tsx` | 48 | 2 | 2 | 0 | token-driven (dual-theme prop) |
| `components/AboutSection.tsx` | 204 | 13 | 12 | 2 | mixed |
| `components/ui/TechBadge.tsx` | 28 | 6 | 5 | 0 | mixed (variant map) |
| `components/HowIBuildSection.tsx` | 221 | 18 | 13 | 1 | raw-heavy |
| `components/Navbar.tsx` | 162 | 21 | 9 | 2 | raw-heavy (dual-state) |
| `components/modals/ContactModal.tsx` | 201 | 32 | 0 | 0 | raw-only |
| `components/modals/ProjectModal.tsx` | 171 | 30 | 0 | 0 | raw-only |
| `components/modals/ResumeModal.tsx` | 157 | 37 | 0 | 0 | raw-only |
| `components/modals/ArticleModal.tsx` | 104 | 21 | 0 | 0 | raw-only — **deleted by P4B** |
| `components/ui/Handwriting.tsx` | 108 | 3 | 0 | 0 | raw-only (colour map) |
| `components/ui/CustomCursor.tsx` | 79 | 1 | 0 | 0 | raw-only |
| `app/layout.tsx` | 65 | 3 | 0 | 0 | raw-only |
| `components/HeroSection.tsx` | 168 | 26 | 2 | 0 | **already dark** |
| `components/Footer.tsx` | 219 | 52 | 0 | 3 | **already dark — worst case** |
| `app/not-found.tsx` | 34 | 8 | 2 | 0 | **already dark** |
| `components/icons/*.tsx` | 294 | 0 | 0 | 0 | `currentColor` only — nothing to do |

Eight files are token-driven or close to it. Nine are raw-heavy or raw-only. `Footer.tsx`
alone carries 52 raw colour utilities and three hardcoded hexes — `bg-[#070A0F]` (the
footer plate), `bg-[#101622]` (the newsletter input) and `bg-[#131926]` (the back-to-top
button) — and not one semantic token.

### The part that makes this a *two-way* pass

`HeroSection.tsx`, `Footer.tsx` and `app/not-found.tsx` **are already dark**. They are not
un-themed light components waiting for a dark variant; they are finished dark surfaces with
no light-theme vocabulary at all. Every colour in them is a dark-mode value written as a raw
class.

So P5 is not "add a dark mode". It is a two-way pass:

- **~17 light components** need dark values invented.
- **3 dark components** need light values invented.
- Both halves must resolve through the *same* semantic tokens, or the toggle will flip half
  the page.

Four smaller surfaces are dark islands inside otherwise light sections and have the same
problem in miniature:

| Island | File | Colour |
|---|---|---|
| Terminal card | `HowIBuildSection.tsx:100` | `bg-[#0B1220] border-slate-800` |
| Contact photo panel | `ContactSection.tsx:151` | `bg-[#080B10] border-4 border-white` |
| Sticky note | `AboutSection.tsx:127` | `bg-[#161F2E] text-white` |
| Image wells | `ProjectsSection.tsx:84`, `WritingSection.tsx:109`, `SkillsSection.tsx:73` | `bg-slate-950` / `bg-slate-900` |

### What already resembles theme switching

- **`Navbar.tsx`** is the closest thing in the repo. `scrolled` drives a full dual-state
  colour swap — transparent-over-hero (`text-white`, `bg-white/5`) becomes
  `bg-white/90 backdrop-blur-md border-b border-[#E4E9F1] text-ink`. It is the existing proof
  that a two-state colour model works here, and it is where the toggle goes. Note it also has
  a *third* state — the mobile drawer is unconditionally `bg-white/98 … text-ink`.
- **`SectionHeader.tsx`** and **`QuoteBox.tsx`** already take `theme?: 'light' | 'dark'` and
  branch every colour on it. **Neither is ever called with `theme="dark"`** — the dark branch
  is dead code today and P5 can reuse it directly.
- **`TechBadge.tsx`** already has a `dark` variant
  (`bg-white/10 text-slate-200 border-white/10`). Also never called with it.
- **`Handwriting.tsx`** has a four-way `color` map (`blue` / `charcoal` / `white` / `slate`)
  hardcoded to `text-blue-600`, `text-slate-800`, `text-white/90`, `text-slate-500`. Three of
  the four break on a dark background.

### §2 Method

```
# raw colour utilities
grep -oE '\b(bg|text|border|from|via|to|placeholder|ring|shadow|divide|fill|stroke)-(white|black|slate-[0-9]+|gray-[0-9]+|zinc-[0-9]+|neutral-[0-9]+|emerald-[0-9]+|amber-[0-9]+|red-[0-9]+|green-[0-9]+|indigo-[0-9]+)\b|\b(bg|text|border|from|via|to)-\[#[0-9A-Fa-f]{3,8}\]' FILE | wc -l

# semantic-token utilities
grep -oE '\b(bg|text|border)-(bg|text|border|ink)(-[a-z-]+)?\b' FILE | wc -l
```

Re-run these after P5. The `raw` column must be 0 for every file except the icon modules.

---

## 3. The target theme model

### Mechanism

| Piece | Choice |
|---|---|
| Tailwind | `darkMode: 'class'` in `tailwind.config.js` |
| Provider | `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange` |
| Root element | `<html suppressHydrationWarning>` in `app/layout.tsx` |
| Default | `prefers-color-scheme`; an explicit user choice is persisted to `localStorage` and wins |
| No-flash | inline `<script>` in `<head>`, before paint |
| Toggle | in `Navbar.tsx`, beside the "Let's Talk" button; mirrored into the mobile drawer |

The no-flash script must run synchronously in `<head>` and set the class on
`document.documentElement` before the first paint. Without it the page renders light, then
snaps to dark — worse than no dark mode. `next-themes` ships this as `ThemeProvider`'s
injected script; verify it lands in `<head>` and not after `<body>` when rendered by the
Next 16 App Router, and do not rely on a `useEffect`.

`disableTransitionOnChange` matters here because dozens of elements carry
`transition-colors duration-200/300`; without it every toggle plays a 300ms cross-fade of the
whole page.

### The token contract

**Every colour resolves through a semantic token that has a defined value in both themes.**

`globals.css` becomes the source of truth:

```css
:root            { --bg-primary: #FFFFFF; --text-primary: #0B1220; /* … */ }
:root.dark       { --bg-primary: #080B10; --text-primary: #F7F9FC; /* … */ }
```

`tailwind.config.js` stops holding hexes and points at the variables instead, so
`bg-bg-primary` emits `background-color: var(--bg-primary)` and flips with the class. Slash
opacity (`bg-blue/10`, `border-white/15`) is used in ~30 places, so tokens that need it must
be stored channel-only and consumed as `rgb(var(--x) / <alpha-value>)`. Tokens that never
take an opacity modifier can stay as plain `var(--x)`. P5 decides per token and records the
split in a comment at the top of `globals.css`.

**Forbidden after P5**, in `apps/web/components/**` and `apps/web/app/**`:

- `bg-white`, `bg-black`, `text-white`, `text-black`
- any `slate-*` / `gray-*` / `zinc-*` / `neutral-*` utility
- any arbitrary hex (`bg-[#070A0F]`, `border-[#E4E9F1]`)
- `text-blue-600` and friends where the brand blue is meant — use `text-blue`

Permitted: `currentColor` in SVG, `/opacity` modifiers on token classes, and the semantic
status colours (`emerald-*` for "available", `red-*` for the location pin) **only** once they
have been given token names of their own.

### Tokens P5 must add

The current set has no name for the three dark-by-design surfaces, so it cannot express them.
Minimum additions:

| Token | Purpose |
|---|---|
| `--surface-feature` / `--text-on-feature` / `--border-feature` | Hero, Footer, 404 — the inverted plates |
| `--surface-elevated` | cards that sit above `--bg-soft` (today `bg-white` inside a `bg-bg-soft` section) |
| `--surface-overlay` | modal scrim, today `bg-black/60` |
| `--surface-well` | image wells and the terminal card |
| `--status-positive` / `--status-alert` | the emerald "available" dot, the red pin |

### The design call P5 has to make (and record)

In light mode the composition is: dark hero → light body → dark footer. In dark mode the body
goes dark too, and that three-part rhythm collapses if the hero and footer keep their current
values. Two ways out:

- **A — recessed inversion.** The feature surfaces stay the darkest thing on the page
  (`#050709`-ish) and the dark-theme body sits one step lighter at `--bg-dark-soft`
  (`#10151D`). The hero reads as a well. Cheapest, closest to Milan's composition, no new
  artwork. **Recommended.**
- **B — true inversion.** The hero and footer become light plates in the dark theme. Honest
  to the word "inverted", but it reverses the page's visual hierarchy and the hero
  photograph (`/images/hero-desk.png`) is shot for a dark treatment — it would need a second
  asset.

P5 picks one, states which in `STATUS.md`, and applies it consistently to the four dark
islands listed in §2.

---

## 4. The P5 checklist

Work top to bottom. "Extract" means replace raw classes with tokens with no visible change in
light mode; "invent" means a value that does not exist today has to be chosen.

| # | File | Current state | What P5 does |
|---:|---|---|---|
| 1 | `tailwind.config.js` | hexes inline, no `darkMode` | Add `darkMode: 'class'`. Repoint every colour at a CSS variable. Keep the blue ramp literal — it is a palette, not a theme. |
| 2 | `app/globals.css` | `:root` duplicates the config | Becomes authoritative. Add `:root.dark`. Add the §3 tokens. Theme `::selection` and the four `::-webkit-scrollbar` rules — all five are hardcoded and all five invert. |
| 3 | `app/layout.tsx` | `<body className="bg-white text-slate-900 …">` | Add `suppressHydrationWarning` to `<html>`, mount `ThemeProvider`, swap the body classes for tokens. `selection:bg-blue-600` → `selection:bg-blue`. Also see §6.2. |
| 4 | `components/ThemeProvider.tsx` | does not exist | New. `'use client'`, wraps `next-themes`. |
| 5 | `components/Navbar.tsx` | raw-heavy, **dual-state** | Extract both scroll states to tokens, then add the theme axis on top — this is now a 2×2 (scrolled × theme). Mount the toggle here and in the mobile drawer. Highest-risk file in the phase. |
| 6 | `components/HeroSection.tsx` | **already dark**, 26 raw | Extract to `--surface-feature` / `--text-on-feature`. The two `bg-gradient-to-*` overlays reference `bg-dark` and must follow the token. Invent the counter-theme values. |
| 7 | `components/Footer.tsx` | **already dark**, 52 raw + 3 hex | The big one. `#070A0F` → `--surface-feature`; `#101622` → input surface; `#131926` → button surface. The watermark gradient (`from-white/[0.12] via-white/[0.05]`) needs a token, not `white`. |
| 8 | `app/not-found.tsx` | **already dark**, 8 raw | Same treatment as the hero. Small file; do it right after the footer while the feature tokens are fresh. |
| 9 | `components/AboutSection.tsx` | mixed, 2 hex | `#EBF3FE` → `--bg-blue-soft`-family token; `#161F2E` sticky note → `--surface-feature`. The inline handwriting block (lines 85–92) uses `text-slate-500` / `text-slate-700`. |
| 10 | `components/HowIBuildSection.tsx` | raw-heavy, 1 hex | `#0B1220` terminal card → `--surface-well`. The emerald/red traffic-light dots become status tokens. |
| 11 | `components/SkillsSection.tsx` | token-driven | `bg-slate-900` photo well, `border-4 border-white` frame. |
| 12 | `components/ContactSection.tsx` | token-driven, 1 hex | `#080B10` panel, `bg-black/45` floating quote card, `border-4 border-white`. |
| 13 | `components/ProjectsSection.tsx` | token-driven | `bg-slate-950` image well, two `bg-white` cards. |
| 14 | `components/WritingSection.tsx` | token-driven | `bg-slate-900` image well, two `bg-white` cards. |
| 15 | `components/ExperienceSection.tsx` | token-driven, cleanest | Four raw classes. **Plus the `logoBg` wart — see §6.1.** |
| 16 | `components/modals/ProjectModal.tsx` | raw-only, 30 | Full pass. Scrim → `--surface-overlay`. |
| 17 | `components/modals/ContactModal.tsx` | raw-only, 32 | Full pass. Form inputs, placeholders and focus rings all need dark values. |
| 18 | `components/modals/ResumeModal.tsx` | raw-only, 37 | Full pass. The embedded PDF viewer chrome will not theme — accept and note it. |
| 19 | `components/ui/SectionHeader.tsx` | dual-theme prop, unused | Keep the prop (it means "on a feature surface", not "dark mode"). Point both branches at tokens. |
| 20 | `components/ui/QuoteBox.tsx` | dual-theme prop, unused | Same. |
| 21 | `components/ui/TechBadge.tsx` | 4-variant map | All four variants need both-theme values. `light` currently hover-swaps to `bg-slate-200/60`. |
| 22 | `components/ui/Handwriting.tsx` | 4-colour map | `charcoal` and `slate` are invisible on dark; `white` is invisible on light. Rename the map to intent (`on-surface` / `on-feature` / `accent`) and let the tokens do the flipping. |
| 23 | `components/ui/CustomCursor.tsx` | 1 raw | `text-white` on the blue puck. Trivial. |
| 24 | `components/icons/*.tsx` | clean | Nothing. They are `currentColor` throughout. Do not touch. |
| — | `components/modals/ArticleModal.tsx` | raw-only, 21 | **Deleted by P4B before P5 runs.** If it is still present, P4B is not done — stop and check `STATUS.md`. |

After the pass, re-run the two greps from §2 Method. `raw` must be 0 outside `components/icons`.

Manual gate: load `/`, toggle light → dark → light, and confirm the light-mode page is
pixel-identical to `c753fe9`. Then load `/404`, open all three surviving modals in both
themes, and check the navbar in all four states (scrolled × theme).

---

## 5. Component conventions

### The `ui/` primitives

| Primitive | Contract |
|---|---|
| `SectionHeader` | `number` (`"01"`), `badge`, `title`, `highlight` (rendered blue), `titleSuffix`, `description`, `theme`, `breakBeforeHighlight`. Blue dash + blue number + muted badge, then an `h2` at `font-black tracking-heading leading-[1.12]`. |
| `QuoteBox` | `quote`, `author` (defaults `"Milan Kumawat"`), `theme`. Serif `"` in brand blue, italic body, `— Author` beneath. |
| `TechBadge` | `name`, `variant: 'light' \| 'dark' \| 'outline' \| 'blue'`. Pill, `text-[11px] font-semibold`, 1px border. |
| `Handwriting` | `text`, `color`, `rotation`, `size`, `underline`, `arrow`. Caveat, rotated, `whitespace-pre-line`, optional hand-drawn SVG underline or arrow. |
| `CustomCursor` | No props. Self-disables on touch devices. Three states: 8px dot, 40px ring, 64px "VIEW →" puck triggered by `[data-cursor-view="true"]`. |

### Section anatomy

Every section on the home page follows the same skeleton:

```
<section id="…" className="py-20 sm:py-28 lg:py-32 bg-bg-{primary|soft} relative overflow-hidden">
  <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16">
    <SectionHeader number="0N" … />
    …content…
    <QuoteBox … />   /* most sections close with one */
  </div>
</section>
```

The backgrounds alternate — `bg-bg-primary` for About / Experience / How I Build / Contact,
`bg-bg-soft` for Projects / Skills / Writing. That alternation *is* the page rhythm; it is the
first thing that breaks if the two tokens converge in dark mode. Keep a visible step between
them in both themes.

The `id` on each section is load-bearing: `Navbar.tsx` scroll-spies over
`['home','about','projects','experience','skills','how-i-build','writing','contact']` and
`html { scroll-padding-top: 88px }` in `globals.css` offsets the fixed header. P5 touches
neither.

### The rule

**P5 changes colour. Nothing else.**

Not `py-20`. Not `max-w-[1440px]`. Not a `grid-cols-12`. Not a `rounded-2xl`. Not the order of
a `className` string beyond what the colour swap requires. Not a `framer-motion` transition.
Not a component's props unless §4 names it. A diff line that changes a spacing utility is a
bug in the phase, and `00-MASTER-PLAN.md §8` calls the excuse for it out by name.

---

## 6. Known warts

### 6.1 `experience.logoBg` holds Tailwind classes in the database

`02-DATA-MODEL.md` stores `logoBg: v.string()` and flags it for P5. The three seeded values
are:

| Row | `logoBg` |
|---|---|
| `tv-infosoft` | `bg-slate-900 text-white` |
| `eadmin` | `bg-blue-600 text-white` |
| `freelance` | `bg-blue-50 text-blue-600 border border-blue-200` |

`ExperienceSection.tsx:110` interpolates the string straight into `className`. Two of the
three are raw slate/blue-ramp classes, so they will not respond to the theme, and the first
one — dark chip, white text — becomes invisible against a dark card.

There is a second, worse problem: Tailwind's JIT scans source files. A class that exists only
as a database string is never seen by the scanner and **may not be emitted into the CSS at
all** once the value stops appearing in `portfolioData.ts`. It works today only because the
file is still in the content glob. After P3 it is a latent break.

Options, in order of preference:

1. **Reinterpret the field as a variant key, resolve at render.** `logoBg` stops meaning
   "class list" and starts meaning "variant name" — `ink` / `blue` / `blue-soft` —
   with a lookup table in `ExperienceSection.tsx` mapping each key to a both-theme token
   pair, plus a pass-through fallback for unrecognised strings. No schema change (the field
   stays `v.string()`), no re-seed required beyond a three-row data patch, admin keeps
   working, and the classes are back in source where the JIT can see them.
2. **Keep class lists but make them token classes** — `bg-ink text-text-on-dark`. Least code,
   but the JIT problem remains and the database still stores presentation.
3. **Add a `logoVariant` field.** Cleanest model, but the schema is frozen at P1; this needs
   a contract change, a `02-DATA-MODEL.md` edit in the same commit, and a `STATUS.md` entry.

**P5 decides.** If it picks (1), the three-row patch is a P5 change, not a re-run of P2's
seed — note it in `STATUS.md` so a later re-seed does not reintroduce the class strings.

### 6.2 The fonts are loaded twice, and one of them is wrong

`globals.css:1` `@import`s **Caveat + Instrument Serif + Manrope + JetBrains Mono** from Google
Fonts. `app/layout.tsx` then adds a `<link>` for **Caveat + Plus Jakarta Sans + JetBrains
Mono**. So:

- Caveat and JetBrains Mono are fetched twice.
- **Plus Jakarta Sans is downloaded and never used** — `--font-manrope` is what `font-sans`
  resolves to, and nothing references Plus Jakarta Sans.
- Instrument Serif arrives only via the CSS `@import`, which blocks rendering later than a
  `<link>` would.
- Nothing uses `next/font`, so there is no preload, no `font-display` control and no
  self-hosting.

P5 owns both files, so it *can* fix this. It should fix only the duplication and the dead
Plus Jakarta Sans request — that is invisible to a visitor. Migrating to `next/font` changes
font metrics and fallback behaviour, which is a design change: raise it with Milan and put it
in P7, not P5.

### 6.3 Dead theme code already in the tree

`SectionHeader`, `QuoteBox` and `TechBadge` each carry a complete dark branch that nothing
calls. It was written for the dark hero and footer and then not wired up. P5 should treat
these as a head start, not as untested code — but do read them before reusing them, because
they encode "on a dark surface", which after P5 is not the same thing as "dark theme".
