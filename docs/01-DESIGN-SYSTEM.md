# Design System

> Extracted from the eight mockups in `references/`. P2 implements this literally.
> Station agents consume it and never invent new values.

---

## 1. Colour Tokens

Declared as CSS custom properties in `src/app/globals.css`, consumed by Tailwind v4
via `@theme`.

```css
:root {
  /* brand */
  --brand-400: #3B82F6;
  --brand-500: #2563EB;   /* the blue in every headline's second half */
  --brand-600: #1D4ED8;
  --brand-050: #EFF5FF;   /* icon tile backgrounds */

  /* ink — headings and body on light */
  --ink-900: #0A1220;     /* headline black-navy */
  --ink-700: #1B2A41;
  --ink-500: #47586F;     /* body copy */
  --ink-400: #6B7C93;     /* muted / meta */

  /* surfaces */
  --surface-page:  #F5F8FC;   /* the light section background */
  --surface-card:  #FFFFFF;
  --surface-sunk:  #EEF3FA;   /* inset panels, checklists */
  --border-soft:   #E3EAF3;

  /* dark stations (hero, footer, contact right panel) */
  --night-900: #05080E;
  --night-800: #0A0F17;
  --night-700: #111827;
  --night-fg:  #F2F6FC;
  --night-mut: #8B9AAF;

  /* accents used inside project mockups only */
  --accent-green: #16A34A;
  --lamp-warm:    #F5A524;   /* the desk lamp key light, 3D only */
}
```

**Dark stations** are `hero` and `contact`. Everything between is light. The
`SceneDirector` cross-fades `--page-bg` and flips `data-theme` on `<html>` as the
camera crosses a station boundary, so the DOM overlay recolours in sync with the 3D
background. P2 builds this; station agents just declare `environment.theme`.

---

## 2. Typography

| Role | Family | Source | Weights |
|---|---|---|---|
| Display / headings | **Satoshi** | Fontshare (free, self-host) | 700, 900 |
| Body / UI | **Inter** | `next/font/google` | 400, 500, 600 |
| Handwritten annotations | **Caveat** | `next/font/google` | 500, 600 |
| Code blocks | **JetBrains Mono** | `next/font/google` | 400, 500 |

If Satoshi self-hosting is a problem, the approved fallback is **Sora** from Google
Fonts. Do not substitute anything else.

### Scale

| Token | Size / line-height | Tracking | Use |
|---|---|---|---|
| `display-xl` | `clamp(3.5rem, 8vw, 7.5rem)` / 0.92 | -0.035em | Hero name |
| `display-lg` | `clamp(2.5rem, 5.2vw, 4.25rem)` / 1.02 | -0.03em | Section headlines |
| `title-md` | `1.375rem` / 1.3 | -0.01em | Card titles |
| `title-sm` | `1.0625rem` / 1.35 | -0.005em | Sub-card titles |
| `body-lg` | `1.0625rem` / 1.65 | 0 | Section intro paragraph |
| `body` | `0.9375rem` / 1.6 | 0 | Card body |
| `meta` | `0.8125rem` / 1.4 | 0.01em | Dates, captions |
| `eyebrow` | `0.75rem` / 1 | **0.18em**, uppercase | `— 03  PROJECTS` |
| `script` | `clamp(1.05rem, 1.6vw, 1.5rem)` / 1.25 | 0 | Caveat annotations |

### The headline rule

Every section headline is two lines. The **second half is `--brand-500`**, the first
half is `--ink-900`. This is the strongest identity signal in the mockups — never
break it.

```
Turning ideas
into [real solutions.]      <- bracketed part is blue
```

---

## 3. Signature Components

Pulled from the mockups. P2 builds all of these in `src/components/ui/`.

| Component | Spec |
|---|---|
| `<Eyebrow n="03">PROJECTS</Eyebrow>` | 40px blue rule, then bold blue number, then tracked uppercase grey label |
| `<Script rotate={-6}>Good Ideas Lead to Great Things.</Script>` | Caveat, slight rotation, optional hand-drawn underline swoosh (inline SVG, `stroke-dasharray` draw-on) |
| `<Card>` | `--surface-card`, `radius: 16px`, `border: 1px --border-soft`, shadow `0 1px 2px rgba(10,18,32,.04), 0 8px 24px rgba(10,18,32,.04)` |
| `<IconTile>` | 44px, `radius: 12px`, `--brand-050` bg, blue stroke icon inside |
| `<Chip>` | tech tag: `radius: 8px`, `--surface-sunk` bg, `meta` type, 8px/14px padding |
| `<ArrowLink>` | blue label + `→` that translates 4px right on hover |
| `<Button variant="primary">` | blue pill, 14px/28px padding, `radius: 999px`, arrow icon, magnetic in P4 |
| `<Button variant="ghost">` | transparent, 1px border, used on dark |
| `<CarouselNav>` | two 52px circles: ghost-left, solid-blue-right |
| `<Quote>` | large blue `"` glyph, italic text, em-dash attribution |
| `<StatBlock>` | `display` number + `meta` label, vertical hairline dividers |
| `<SectionShell>` | the layout wrapper: full viewport, grid, `data-station` attr, theme-aware |

### Radii & spacing

Radii: `8 / 12 / 16 / 24 / 999`. Spacing scale: `4 8 12 16 24 32 48 64 96 128`.
Section horizontal padding: `clamp(24px, 5vw, 96px)`. Max content width `1440px`.

---

## 4. Motion

### Curves

```ts
export const EASE = {
  out:     [0.16, 1, 0.3, 1],      // default reveal — power4.out feel
  inOut:   [0.76, 0, 0.24, 1],
  camera:  [0.22, 1, 0.36, 1],     // camera moves, expo.out feel
  snap:    [0.34, 1.56, 0.64, 1],  // chip/hover pop, slight overshoot
}
```

### Durations

| Interaction | Duration |
|---|---|
| Hover state | 180ms |
| Button press | 90ms |
| Card reveal on enter | 620ms, 60ms stagger |
| Headline word reveal | 780ms, 45ms stagger |
| Station cross-fade (background) | 900ms |
| Camera station-to-station | scroll-bound (no duration) |
| Script annotation draw-on | 900ms, 200ms delay |

### DOM reveal pattern

Every section uses the same entrance: content enters on `y: 24px, opacity: 0,
filter: blur(6px)` and settles to `y: 0, opacity: 1, blur(0)` with `EASE.out`,
triggered when the station's `localProgress > 0.08`. Headlines reveal per-word.
Cards stagger. This consistency is what makes the site feel authored rather than
assembled — do not invent per-section entrances.

### Reduced motion

`prefers-reduced-motion: reduce` disables: idle 3D animation, script draw-on,
blur in reveals, parallax, cursor effects, bloom pulsing, audio. Opacity-only
reveals remain. The camera still follows scroll — that is navigation, not decoration.

---

## 5. The 3D / DOM Relationship

- The canvas is `position: fixed; inset: 0; z-index: 0` and never scrolls.
- DOM sections are `z-index: 10`, transparent background, and scroll normally.
- Where a station needs the 3D to read through a card (Projects, Writing), the card
  uses `backdrop-filter: blur(20px) saturate(140%)` with `background:
  rgba(255,255,255,0.72)`. Cap this to three simultaneous blurred surfaces — it is
  the single most expensive DOM effect on the page.
- Nothing interactive is ever drawn inside the canvas. All links and buttons are
  real DOM elements. The 3D reacts to them via `useInteraction()`.
