# Milan Kumawat — Portfolio

One continuous 3D world. One camera. Eight stations. Scroll is the only control.

This is not eight pages with 3D decoration. It is a single persistent WebGL canvas
containing one world, and scrolling flies a camera rig through it. The DOM content —
headings, cards, links — floats *over* the canvas and recolours as the camera crosses
each station boundary.

**The DOM layer alone is a complete, readable, indexable portfolio with zero 3D.**
That is a hard requirement, not a fallback, and it is tested.

---

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Optimises `assets/incoming/`, then a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` · `pnpm typecheck` | ESLint · `tsc --noEmit` |
| `pnpm test` | The Playwright suite (builds and serves on 3111) |
| `pnpm budgets` | Draw-call, triangle, bundle-size and GPU-leak gate |
| `pnpm qa` | Fast full-page sweep — structure, camera, themes, six viewports |
| `pnpm assets` | The asset pipeline on its own; reports what is missing |

### Dev URLs

| URL | Effect |
|---|---|
| `?debug=1` | Stats HUD: fps, draw calls, triangles, mounted stations, budget verdict |
| `?q=low` · `?q=medium` · `?q=high` | Pin a quality tier |
| `?adaptive=0` | Disable the adaptive quality monitor |
| `/fallback` | The static, zero-JavaScript version |

---

## The architecture in a paragraph

`app/page.tsx` renders three things: a fixed `<canvas>` at `z-0`, a scrolling
`<main>` of eight `<section>`s at `z-10`, and the interaction layer. Lenis drives
scroll through GSAP's ticker, and `store/useScroll.ts` turns raw scroll into a single
number — **canonical progress**, 0 to 1 across the whole page. `lib/curves.ts` owns a
CatmullRom path through the world and maps that number to a camera position, look-at
and FOV. `engine/SceneDirector.tsx` reads the scene registry, mounts each station when
progress enters its range, places it at its world anchor, and cross-fades the
background and `data-theme` between neighbours. Everything else — every station, every
component — is downstream of that one number.

```
docs/00-MASTER-PLAN.md    the vision and the phase map
docs/02-ARCHITECTURE.md   the contracts. Read this before changing anything.
docs/03-SCENE-BIBLE.md    the eight stations in 3D detail
docs/ASSET-PROMPTS.md     every outstanding asset, with generation prompts
docs/STATUS.md            the build log — every decision and every bug, dated

src/engine/     canvas, camera rig, scene director, post FX, quality tiering
src/scenes/<id>/  one folder per 3D station; index.ts is the frozen registry
src/sections/     the DOM overlay for each station; index.ts is frozen too
src/components/ui/         the design-system kit — import from the barrel
src/components/a11y/       skip link, station nav, focus-scroll, static backdrop
src/components/interaction/ cursor, magnetism, station transitions, easter eggs
src/data/       all copy, typed, transcribed from docs/06-CONTENT.md
scripts/        asset pipeline, budget gate, QA sweep, station probe
tests/          the Playwright suite
```

---

## Things that will bite you

These each cost real time to find. They are all commented at the site of the problem,
but they are worth knowing up front.

- **Never pass a `renderPriority` to `useFrame`.** Any non-zero value switches React
  Three Fiber to manual rendering and *nothing on the page draws at all*.
- **`lib/shader.ts` splits its preludes by stage.** `VERTEX_PRELUDE` is
  derivative-free; `FRAGMENT_PRELUDE` adds `aaLine`/`aaGrid`, which call `fwidth`.
  Using the fragment one in a vertex shader fails to link **silently** — the geometry
  simply never appears.
- **`active` is a reserved word in GLSL ES 1.00.** The link error is truncated to
  `'active' : Illegal` with no line number.
- **A station's `progress` prop is quantized to ~2% steps.** For anything that must
  move smoothly, read `scrollState` from `@/store/useScroll` inside `useFrame`.
- **Import icons explicitly.** `import * as simpleIcons` plus a dynamic lookup cannot
  be tree-shaken and pulls 2.2 MB into the client bundle.
- **`next dev` and `next build` cannot share `.next`.** Set `NEXT_DIST_DIR` if you
  need both at once.
- **`pnpm build` occasionally dies with `An error occurred in next/font` and a
  `TypeError: Cannot read properties of null`.** That is a failed network fetch to
  Google Fonts, not a code error — all four faces come from `next/font/google`. It
  hit roughly one build in five on a flaky connection; just run it again. Next caches
  the fetch in `.next/cache`, so it only bites on a cold build. If it becomes
  tiresome, self-host: drop the woff2 files into `public/fonts/` and switch
  `src/app/layout.tsx` to `next/font/local` — `docs/ASSET-PROMPTS.md` §A6 has the
  detail, and the display face is already set up to be swapped that way.

---

## How to change things

### Swap an asset

Drop the file into `assets/incoming/` with the exact filename from
`docs/ASSET-PROMPTS.md`, then `pnpm build`. The pipeline resizes, encodes AVIF/WebP,
writes into `public/`, and generates `src/data/assetManifest.ts` with real dimensions.

Three stations render procedural placeholders behind a flag — `USE_PORTRAIT_IMAGE` in
`scenes/about/Portrait.tsx`, `USE_PROJECT_IMAGES` in `scenes/projects/Slab.tsx`,
`USE_ARTICLE_IMAGES` in `scenes/writing/Sheet.tsx`. Flip the flag when the real file
lands.

### Change copy

`src/data/`. Never type a string into a component — the content doc is the source and
the data modules are its typed form.

### Add a ninth station

1. `lib/curves.ts` — add a `StationPath`: an anchor, a scroll range, a boundary
   waypoint, and any shaping `mids`. **Renormalise every other range so they still
   sum to 1.** Station N's `to` is N+1's `from` by construction, so you cannot
   introduce a camera seam by editing a manifest.
2. `engine/types.ts` — add the id to `StationId` and `STATION_IDS`.
3. `src/scenes/<id>/` — a `manifest.ts` using `stationCamera('<id>')` and a `Scene.tsx`
   that branches on `quality` and honours `reducedMotion`.
4. `src/sections/<Name>.tsx` — wrap in `SectionShell` and build from
   `@/components/ui`. Headlines go through `<Headline>`, which enforces the
   blue-second-half rule mechanically.
5. Add both to `scenes/index.ts` and `sections/index.ts`.
6. `pnpm budgets` to confirm you are inside the frame budget.

### Tune the camera

`lib/curves.ts` is authoritative. Manifests call `stationCamera(id)` and must not
hand-write keyframes; a dev-only check in `scenes/index.ts` warns if one does.

---

## What is verified, and what is not

`pnpm test` (33 checks across a desktop and a mobile project), `pnpm qa` (30) and
`pnpm budgets` (12) all pass, and CI runs
all three on every push. Between them they cover: the camera visiting all eight
stations with no discontinuity, theme flips at every boundary, the active station's
DOM always being on screen at six viewports from 390 to 2560, all three quality tiers,
reduced motion, the no-WebGL path, keyboard navigation and focus never landing
off-screen, axe with zero serious or critical violations on both pages, link
integrity, the resume PDF, and no GPU resource leak across three full scroll cycles.

**Not verified, and honestly so:**

- **Frame rate.** Every measurement was taken in headless Chrome on SwiftShader, a
  software rasteriser that reports 0–5fps regardless of what the scene does. The
  60fps-desktop / 30fps-mid-tier-Android criterion needs real hardware and a real
  phone. Draw calls and triangle counts are all comfortably inside budget, which is
  the best proxy available here.
- **Cross-browser.** Chrome only. Safari is the one to check — `MeshTransmissionMaterial`
  and `backdrop-filter` together are a known perf cliff, and the Projects station is
  where it would show.
- **Screen readers.** The structure a screen reader consumes is verified; how it
  actually sounds is not.
- **Lighthouse and the deployed OG card.** Both need a public URL.
