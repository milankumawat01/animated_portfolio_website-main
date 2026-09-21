# Build Status

> Live tracker. Agents update **only their own row**, and **append** to the log.
> Never rewrite another agent's line. See `docs/05-PARALLEL-PLAYBOOK.md` §5.

**Last updated:** 2026-09-22 — P0–P6 done. P7 in progress.

---

## Phase board

| Phase | Name | Status | Owner | Notes |
|---|---|---|---|---|
| P0 | Foundation & Scaffold | ✅ Done | main | Next 15.5.25 · R3F 9.7 · three 0.186 |
| P1 | Core 3D Engine & Contracts | ✅ Done | main | Contracts FROZEN. Registries sealed. |
| P2 | Design System & DOM Kit | ✅ Done | main | Kit complete. Import from `@/components/ui`. |
| P3A | Hero station | ✅ Done | agent | 3/24 calls · 1.5k/180k tris |
| P3B | About station | ✅ Done | agent | 8/14 calls · 8k/60k tris |
| P3C | Projects station | ✅ Done | agent | 9/28 calls · 6k/40k tris |
| P3D | Experience station | ✅ Done | agent | 5/12 calls · 13k/90k tris |
| P3E | Skills station | ✅ Done | agent | 3/8 calls · 3.5k/25k tris |
| P3F | How I Build station | ✅ Done | agent | 5/16 calls · 1.8k/30k tris |
| P3G | Writing station | ✅ Done | agent | 5/10 calls · 7.5k/20k tris |
| P3H | Contact station | ✅ Done | agent | 10/20 calls · 2.8k/70k tris |
| P4 | Interaction & Polish | ✅ Done | main | Audio omitted — no A8 assets |
| P5 | Performance & Assets | ✅ Done | agent | 636 kB → 528 kB first load |
| P6 | A11y, SEO, Fallback | ✅ Done | agent | Static fallback + no-JS path |
| P7 | QA & Deploy | 🟦 In progress | main | — |

Status values: `⬜ Not started` · `🟦 In progress` · `✅ Done` · `⚠️ Blocked` · `🔁 Needs rework`

---

## Asset checklist

See `docs/04-ASSET-MANIFEST.md` for specs. Tick when the file lands in `assets/incoming/`.

- [~] A1 `monogram.svg` 🔴 — geometric placeholder at `public/monogram.svg`, replace with the real mark
- [ ] A2 `portrait.jpg` 🔴
- [ ] A2 `desk-dark.jpg` 🔴
- [ ] A2 `workspace.jpg` 🟡
- [ ] A3 `project-hiro.png` 🔴
- [ ] A3 `project-salezo.png` 🔴
- [ ] A3 `project-autoresumebot.png` 🔴
- [ ] A3 `project-internal-tools.png` 🔴
- [ ] A4 four `article-*.jpg` 🟡
- [ ] A5 gap-list logos 🟡
- [ ] A6 Satoshi woff2 🟡
- [ ] A7 `Milan_Kumawat_Resume.pdf` 🔴
- [ ] A8 audio 🟢
- [ ] A9 answers: eAdmin dates · email domain live · article URLs 🟡

---

## Measured budgets

Filled in by each station agent from the `?debug=1` HUD.

| Station | Draw calls (budget) | Triangles (budget) | FPS high | FPS low |
|---|---|---|---|---|
| hero | 3 / 24 | 1.5k / 180k | not measured | not measured |
| about | 11 / 42* | 9.5k / 100k* | not measured | not measured |
| projects | 14 / 40* | 19.2k / 130k* | not measured | not measured |
| experience | 14 / 40* | 19.2k / 130k* | not measured | not measured |
| skills | 8 / 8 | 16.7k / 25k | not measured | not measured |
| build | 8 / 24* | 16.7k / 55k* | not measured | not measured |
| writing | 5 / 30* | 7.6k / 90k* | not measured | not measured |
| contact | 10 / 20 | 2.8k / 70k | not measured | not measured |

\* Budget is the **sum of the stations mounted at that sample** — `mountPadding`
keeps a neighbour alive across every boundary, so the renderer's totals are almost
never one station's cost alone. Worst case over 24 scroll samples at `q=high`,
from `node scripts/check-budgets.mjs`. Every station is inside its own budget;
nothing needed renegotiating.

**FPS is deliberately blank.** Every measurement tonight ran in headless Chrome on
SwiftShader, a software rasteriser, which reports 0–5fps at every tier regardless of
what the scene does. Writing a number there would be worse than leaving it empty.
**60fps desktop / 30fps mid-tier Android is the one acceptance criterion that has
not been verified** and it needs real hardware — see the P7 handover.

---

## Cross-phase requests

> Append only. Format: `- [from P3C → P2] need a <Chip variant="ghost"> — worked around with a local style.`

- [from P3A/P3C → P4] **COMPOSITION PASS — the big one.** Two stations reviewed so
  far and both have the same class of problem, so treat it as systemic rather than
  per-station:
  1. *Hero*: the particle mark overlaps the headline column at 1440×900. "Milan
     Kumawat" reads through a dense cloud. One offset constant in `hero/Scene.tsx`.
  2. *Projects*: the glass slabs render as a ~40px thumbnail strip. They are meant to
     be the set piece and the DOM cards are carrying the whole station. Root cause is
     the camera path, not the scene: `curves.ts` puts the camera ~53 units from the
     projects anchor at local 0 and still ~18 at local 0.5, so a 1.6-unit slab is
     tiny for most of the station. Cheapest safe fix is to scale the arc and slabs up
     in `projects/Scene.tsx`; the alternative is tightening the path in `curves.ts`,
     which reframes every station and would invalidate tuning the agents already did.
  3. *`SectionShell`*: a 100vh sticky child inside a 1.4–2.2× viewport section pins
     for only `H − 100vh`, so DOM copy starts scrolling away around local 0.3–0.55
     while the camera is still doing its most interesting work. Structural; decide it
     once, across all eight stations, with everything built.
  Do this with all eight stations present, not piecemeal.
- [from P3A → P3H] `MonogramPoints` gained an optional count-aware `opacity` prop
  (default `0.22 × (150000/count)^0.47`, clamped 0.14–0.85) so a low-count cloud does
  not saturate to a white lump. The required four-prop call works unchanged at any
  count. Other optional props: `spread`, `idle`, `size`.
- [from P3A → P1, FIXED] `SHADER_PRELUDE` bundled `aaLine`, which calls `fwidth`.
  Derivatives do not exist in a GLSL ES 1.0 vertex stage, so any vertex shader
  including it failed to link **silently** — geometry simply never drew. `lib/shader.ts`
  now exports `VERTEX_PRELUDE` (derivative-free) and `FRAGMENT_PRELUDE` (adds `aaLine`
  and a new `aaGrid`); `SHADER_PRELUDE` is aliased to the fragment set so existing
  fragment shaders keep working. Both running agents were messaged.
- [from P3C → P4] Local hover store at `src/scenes/projects/useProjectHover.ts`
  (`{ hovered: string | null, setHovered(id) }`, keyed on `Project.id`, read via
  `.getState()` in useFrame). Three import sites. Absorb into `useInteraction`.
- [from P3C → P2, FIXED] `Reveal`, `Headline` and `Script` left `filter: blur(6px)`
  painted on permanently under reduced motion — the entire DOM overlay rendered out of
  focus on every station. `reducedMotion` starts false and flips true after device
  detection, and the reduced variants dropped the `filter` key, so motion animated
  only `opacity` and never cleared the blur from the first render. Both variants now
  declare the same keys. Verified fixed with `--reduced` probe.
- [from P3C → P5] `Slab.tsx` has `const USE_PROJECT_IMAGES = false` with the real
  image-load path already written behind it. Flip it when A3 lands.
- [from P3E → P4] Local hover store at `src/scenes/skills/useSkillHover.ts`
  (`{ hoveredCategory: string | null, setHoveredCategory(id) }`). Written from
  `sections/Skills.tsx` on pointer **and focus/blur**, so keyboard users get the
  highlight too — preserve that when absorbing it into `useInteraction`.
- [from P3E → P1, FIXED] `postState.dofFocusDistance` defaulted to 0.02, which focuses
  at ~5 world units. Every station frames its subject 8–20 units out, so at the `high`
  tier the entire site rendered as mush and read as a shader bug. Added
  `focusAtDistance(worldUnits)` to `engine/PostFX.tsx` and defaulted to ~13 units.
  Stations should call the helper rather than guess.
- [from P3E → P1, FIXED] R3F forces `pointerEvents: 'auto'` on the container div
  `<Canvas>` creates, which silently defeated the `pointer-events: none` wrapper.
  Nothing was broken in practice (the DOM overlay is z-10 and always won) but the
  guarantee the comment described was not real. Now set via the `style` prop, which
  merges into that container. A station re-enabling it on the canvas element still
  works.
- [from P3F → P2, FIXED] `Card` silently discarded its own styling whenever a `style`
  prop was passed: it merged `style` into the defaults and then spread `{...rest}`
  *after*, clobbering the whole object. Cards lost background, radius, border and
  shadow. Two stations hit it independently. `style` is now destructured out and
  applied last.
- [from P3F → P2, FIXED] `CodeBlock` retyped from scratch every time the station was
  re-entered, because the effect restarted on `active` false→true. Now latched with a
  done ref. P3F's local `BuildCode` wrapper is now redundant but harmless.
- [from P3B → P1, FIXED] The HUD compared whole-scene draw calls against a single
  station's budget, but `mountPadding` keeps a neighbour alive across every boundary
  — so About read as over budget purely because Projects was warming up next to it.
  `SceneDirector` now exports `mountedStations` and the HUD sums their budgets.
- [from P3D/P3F → P4] Measured `SectionShell` pin windows, for the composition pass:
  global progress is `scroll / (pageHeight − 100vh)` while a section's top sits at
  `rangeStart × pageHeight`, so local progress runs **ahead** of the section's own
  scroll by up to 100vh. For Experience the sticky child is pinned across local
  0.226–0.746; for Build, 0.48–0.857. Reveals fire at 0.08, which on some stations is
  while the content is still below the fold. Worth a single pass over all eight.
- [from P3G → P4] **How I Build bleeds two stations either side.** Its blueprint grid
  plane is `PLANE_W = 200 × PLANE_D = 190` world units centred on Build's anchor at
  z −210, so it spans z −310 to −110 — across the whole of Writing *and* Contact. It
  is the most visible thing in Writing's lower half and directly fights that station's
  "light, airy, weightless" brief. One constant in `scenes/build/BlueprintGrid.tsx`.
- [from P3G → P4, judgement call] The environment cross-fade interpolates between
  station *centres*, so Writing's background is already lerping toward Contact's
  near-black through its last third. Writing fades its sheets out over global
  0.888–0.908 to cope. This may be exactly right — approaching the dark bookend
  should feel like dusk — but it is worth looking at once with all eight present.
- [from P3H → P4] Local hover store at `src/scenes/contact/useTileHover.ts`. That is
  **three** local stores now (projects, skills, contact) for P4 to absorb into
  `useInteraction`. Contact's also exports `CONTACT_TILE_IDS`.
- [from P3H → P7] A vertex-stage varying carrying *arithmetic* on `uv.y` came back as
  a constant 0 under ANGLE/SwiftShader — three separate formulations all failed, and
  the lamp cone drew nothing. Moved to the fragment stage, which is correct either
  way. **Unknown whether this reproduces on real GPU drivers**; worth a look during
  cross-browser testing since it would silently blank geometry.
- [from P0 → P5/assets] `simple-icons@16.32.0` has **no mark** for: **OpenAI**,
  **LlamaIndex**, **VS Code**, **RAG**. `TechLogo` renders a monogram tile for these
  until Milan supplies 128×128 SVGs. Aliases resolved for the rest — see
  `src/data/techIcons.ts`. (`FastAPI`, `Claude` and `Convex`, which the manifest
  predicted would be missing, all resolve fine.)
- [from P0 → all] Display face is **Sora** (`next/font/google`), not Satoshi — no
  woff2 was supplied in `assets/incoming/`. Swap is a one-line change in
  `src/app/layout.tsx` when the file lands.

---

## Log

> Append only. Format: `- [P0] 2026-09-21 — done. Next 15 scaffolded, 6 data files written.`

- [plan] 2026-09-21 — Master plan, architecture, design system, scene bible, asset
  manifest, parallel playbook, content doc, and 16 phase briefs authored. `/me` skill
  installed. Ready for P0.
- [P0] 2026-09-21 — done. Next 15.5.25 scaffolded by hand (not create-next-app, the
  repo root was non-empty). Version triple pinned and verified: three 0.186.0 /
  @react-three/fiber 9.7.0 / @react-three/drei 10.7.8 / postprocessing 6.39.5, and
  react pinned to 19.2.8 because R3F 9.7 declares `react: >=19 <19.3`. Seven data
  files written from `docs/06-CONTENT.md` verbatim (the six planned plus `copy.ts`
  for per-station strings and `techIcons.ts` for the icon slug map). GLSL raw import
  verified through both the webpack rule and the turbopack rule. Resume PDF copied
  from `.old/` to `public/`. Build, lint and typecheck all clean.
- [P1] 2026-09-22 — done. Engine, both registries and all eight stubs landed;
  `src/scenes/index.ts` and `src/sections/index.ts` are now frozen.

  Camera continuity is structural, not manual: `lib/curves.ts` owns a single list of
  waypoints and `stationCamera(id)` hands each manifest a `to` that IS the next
  station's `from`, so a seam cannot be introduced by editing a manifest. Stations may
  add shaping waypoints (`mids`) between boundaries — that is how hero pulls back to
  z=13 and still hands off to About on its way forward. A dev-only check in
  `scenes/index.ts` warns if anyone hand-writes keyframes and breaks this.

  Verified in headless Chrome (`node scripts/verify.mjs`, dev server running):
  page height exactly 12.8 viewports; all 8 `data-station` sections present; camera
  sweeps 0→1 with no discontinuity; `data-theme` flips dark→light at p≈0.113 and
  light→dark at p≈0.905, both exactly the computed midpoints; background cross-fades
  smoothly; `?q=low|medium|high` yields 2 / 6 / 14 shader programs; reduced motion
  detected; no-WebGL mounts zero canvases while all 8 DOM sections still render;
  resize holds 12.8vh at 390/768/1280/1440/1920/2560 with no horizontal overflow;
  zero console errors and zero failed requests.

  Bug found and fixed during verification: `StatsCollector` and `FirstFrameSignal`
  each passed a `useFrame` renderPriority. Any non-zero priority switches R3F to
  manual rendering, so nothing was being drawn at all — draw calls sat at 1 forever.
  Both now use the default priority.

  Two deviations from the phase doc, both deliberate:
  - `src/components/chrome/{Nav,ScrollHint,index}.tsx` exist as null-returning
    placeholders because `app/page.tsx` (P1-owned, frozen) mounts them. **P2 owns
    these files and replaces them.** P1 and P2 are both solo and sequential, so there
    is no parallel-conflict risk.
  - Added `src/engine/SiteRuntime.tsx` (boots quality + scroll; renders nothing) and
    `public/monogram.svg` + `src/app/icon.svg`. The favicon was the only console
    error on the page; the monogram is a geometric placeholder with closed filled
    paths, so P3A's particle sampler can consume it as-is.

  Also installed `@playwright/test` and added `scripts/verify*.mjs`. Playwright's
  own Chromium download fails on this machine, so the harness drives the installed
  Chrome via `channel: 'chrome'`. P7 formalises these into `tests/`.
- [P2] 2026-09-22 — done. Tokens, type scale, both themes, the full component kit and
  the chrome. Everything is exported from `@/components/ui` and `@/components/chrome`;
  station agents import from those barrels and never reach into a file.

  Built beyond the phase doc, because eight agents would each have invented them
  otherwise: `Headline` (parses `[brackets]` and renders the blue half — the headline
  rule is now mechanically enforced, not a convention), `Icon` (the named stroke icons
  the copy asks for: code / bulb / users / mail / linkedin / github / file), and
  `RevealGroup`. Components live in `primitives.tsx` rather than one file each; the
  barrel is the public surface, so file granularity is invisible to callers.

  Verified: kitchen-sink page rendered every component in both themes, screenshotted,
  reviewed, deleted. Dark mode resolves entirely through the semantic aliases — no
  component reaches a raw palette token. Nav active state follows the camera across
  all eight stations, correctly holding "Projects" through experience/skills/build
  which have no nav link of their own; clicking a link lands at p=0.250. Full
  `scripts/qa.mjs` run: 24/24 checks pass.

  Three bugs found by actually looking at it:
  - `import * as simpleIcons` pulled the entire ~3,300-icon package into the client
    bundle: **2.71MB → 572kB** first load after switching to explicit named imports
    and a static map. A namespace import plus a dynamic lookup cannot be tree-shaken.
  - The debug HUD reported **1 draw call / 1 triangle on every station**. `gl.info`
    resets at the top of every `render()` call and EffectComposer's final pass is a
    single fullscreen triangle, so the HUD was measuring post-processing, not the
    scene. `StatsCollector` now wraps `gl.render` and snapshots the counters right
    after the root-scene render. **This mattered: every station agent is told to
    verify its budget from this HUD, and it was lying.**
  - `Headline` emitted a double space around a bracketed span.

  Also: simple-icons has no LinkedIn mark (dropped over trademark), so `Icon` draws
  its own. `tsconfig` `incremental` is now false so concurrent agents running
  `tsc --noEmit` do not fight over `tsconfig.tsbuildinfo`.
- [P3A] 2026-09-22 — done. 150k-point GPU monogram, one draw call at any count.
  Measured 3/24 draw calls and 1.5k/180k triangles at high (points are counted under
  `render.points`, not `render.triangles`; the 1.5k is the fog sphere and dust quads),
  1/24 at low. Zero console errors at all three tiers and under reduced motion.
  Monogram is legible as MK at p=0; the dissolve frays left-to-right, M releasing
  before K. `MonogramPoints` verified standalone with only the four required props —
  P3H can consume it.
  **Not verified:** velocity-driven chromatic aberration (the probe scrolls with
  `immediate: true` so velocity is always 0) and 60fps at high (SwiftShader gave 0–4fps,
  a meaningless number). Both need real hardware — carried to P7.
- [P3C] 2026-09-22 — done. Four glass slabs on a shallow arc, scroll-driven three-slab
  traverse, one shared `MeshTransmissionMaterial` across all four (the decision the
  phase doc called out as the most important; confirmed one element in the tree,
  instance handed to the other three). Steady state 9/28 draw calls, 6k/40k triangles;
  8/28 at low with caustics off. Zero console errors at every tier.
  Deviations, all reasoned: project screenshots are procedural canvas textures (A3
  absent — and requesting the missing files would 404 on every load); caustics
  composite normally rather than additive, because additive on a near-white page
  clamps to white and the pools were invisible; caustic planes tilted ~57° because the
  camera runs at slab height and a flat plane collapsed to a smear.
  **Not verified:** carousel smoothness and absence of ripple/idle under reduced
  motion (both are motion properties, unjudgeable from stills at 1–7fps), and GPU
  frame time under 8ms at high. Carried to P7 on real hardware.
- [P3E] 2026-09-22 — done. Seeded force-directed graph, 200 iterations once at mount
  then frozen and memoised. Three objects total: one `LineSegments` for every edge,
  one `InstancedMesh` of icosahedrons for every node, one `InstancedMesh` of
  billboarded atlas quads for every logo. 3/8 draw calls at medium and high, 2 at low;
  3.5k/25k triangles — a seventh of the budget. Zero console errors at every tier.
  Runtime 512×512 icon atlas built from the same explicit `simple-icons` imports the
  DOM uses, with monogram tiles for the four gaps so 3D and DOM agree.
  Pointer-events verified empirically, not reasoned about: `auto` while Skills is
  mounted, fully restored after scrolling past, and every link on hero/skills/writing/
  contact hit-tested afterwards. Layout determinism verified by settling the camera to
  an identical position on two loads and diffing the graph region pixel by pixel.
  Node counts are 24 at low and 42 at medium/high rather than the doc's 48/80 — there
  are only 36 leaves in `data/skills.ts` and padding would mean inventing content.
  **Not verified:** 60fps at high, and how the drag *feels*. Both need real hardware.

- [batch 1] 2026-09-22 — 3A + 3C + 3E integrated. `pnpm build`, `pnpm lint`,
  `pnpm typecheck` and the full `scripts/qa.mjs` suite all clean (24/24). Three engine
  bugs surfaced by the agents and fixed centrally: the vertex-shader prelude, the
  reduced-motion blur, and the DOF focus default. Next: batch 2 (3B/3D/3F).
- [P3B] 2026-09-22 — done. `createDeskGroup(quality)` is a pure function with no React
  anywhere, verified standalone in plain Node: transpiled and imported with `document`
  and `window` asserted undefined, returning a `THREE.Group` of 4 meshes / 4 materials
  at 2.7k–7.3k triangles, placeable in a foreign scene. **P3H's dependency is real.**
  ~24 primitives merged by material into 4 draw calls; because three.js batches by
  mesh and not by shared material, the per-object scale-in stagger had to move into
  the vertex shader (each vertex carries its object's pivot and delay, one `uReveal`
  uniform drives all four meshes). Station total 7–8/14 draw calls, 8k/60k triangles.
  Portrait placeholder is procedural; `USE_PORTRAIT_IMAGE = false` flips it when A2
  lands. Needed nothing from files it did not own.

- [P3D] 2026-09-22 — done. Helix of light rising 18 units over three turns, with a
  comet head that rides 2.1 units *ahead* of the camera so the light pulls you up.
  5/12 draw calls, 13k/90k triangles at high — the loosest load on the site. All
  three timeline cards centre on their year markers; the agent measured the real pin
  window (local 0.226–0.746) rather than trusting the brief's estimate and moved the
  markers to 0.22/0.48/0.74 to suit, so **no shell change was needed**.
  Notable finding: this station cannot be "the bloom station". `--surface-page` is
  ~0.97 luminance after ACES, so any bloom threshold low enough to catch the comet
  blows the whole background white. It earns its light through saturation instead.
  No `Text3D` — there is no Satoshi typeface JSON, and shipping helvetiker next to
  Satoshi would be worse than DOM labels, which the phase doc allows as a final state.

- [P3F] 2026-09-22 — done. Wireframe blueprint pipeline: **five draw calls, zero
  lights, zero assets, zero textures.** All five node frames merged into one
  `LineSegments`, all five conduits into one geometry with one material, all 25
  orbiting glyphs into one `InstancedMesh` whose orbit is computed in the vertex
  shader. Added a fifth conduit the spec did not ask for — a feedback loop from
  Iterate back to Understand — which is `while (curiosity)` drawn as a circuit.
  Verified the diagram constructs itself across the frame sequence, the grid has no
  moiré at grazing angles, and the typewriter does not retype on re-entry (measured
  in the DOM: 5/132 chars on entry, 132 after, still 132 after leaving and returning).
  `active` is a reserved word in GLSL ES 1.00 — three shaders failed to link on it.
  Now noted in `lib/shader.ts` for everyone else.

- [batch 2] 2026-09-22 — 3B + 3D + 3F integrated. Build, lint, typecheck and the full
  QA suite clean.
  **One real regression caught and fixed:** at 390×844 the page grew to 13.6 viewports
  because About and How I Build have DOM content taller than the viewport, inflating
  their sections past their allotted scroll share. That slid every later station's DOM
  out from under the camera visiting it, compounding to ~6% by the footer. Fixed in
  `lib/curves.ts` with `measureStationLayout()` / `toCanonicalProgress()`: the live
  section heights are measured and raw scroll is remapped into the canonical progress
  space the manifests describe, so the camera tracks the DOM whatever the content
  does. Spans are computed as each section's share of total section height, which
  makes the remap *exactly* the identity wherever nothing overflows — desktop
  behaviour is bit-identical and no agent's tuning was invalidated.
  The QA suite now asserts the real invariant at six viewports: whenever the camera
  says it is at station X, X's DOM section is on screen. It also reads live state
  (`window.__scrollState`, `window.__frameStats` under `?debug=1`) instead of scraping
  a HUD that only repaints five times a second, which was making checks flaky.
- [P3G] 2026-09-22 — done. Sheets of paper falling toward the lens: 5 draw calls,
  7.5k/20k triangles, zero added lights (the key is in `paper.frag`). One shallow
  cosine fold rather than a wave train, so it bends like paper instead of rippling
  like cloth, and front/back are genuinely different stock so a turn is legible.
  Scroll-up reversal verified numerically, not by eye: travel climbed 1.38→6.98
  scrolling down and went 6.80→6.11 scrolling up — a real reversal, not a slowdown.
  Caught a real bug by arithmetic that no screenshot would have shown: the Y-squeeze
  plus lift could drop a blank sheet to 0.71 units from the lens axis, inside its own
  half-diagonal, so it would have clipped the near plane at certain spawn angles.
  Also fixed a carousel end-stop bug where clicking to card three snapped back to zero.
  Covers procedural behind `USE_ARTICLE_IMAGES = false`; the four `href` are `'#'` and
  are marked `aria-disabled` with click prevented, so they do not yank the page.

- [P3H] 2026-09-22 — done, and the bookend closes. **Both cross-station imports are
  real**: `MonogramPoints` from P3A runs the hero's dissolve in reverse (1→0 across
  local 0.12–0.62, settled well before the footer), and `createDeskGroup('low')` from
  P3B places the About desk far and dim. Neither was reimplemented.
  10/20 draw calls, 2.8k/70k triangles; 5 draw calls at low. All four contact links
  verified in a real browser and the resume PDF actually resolves — 200,
  application/pdf, 147,518 bytes, magic `%PDF-`.
  Glass panels are one instanced mesh rather than four transmission materials: four
  meshes sharing a material is still four draw calls, and instancing is the only thing
  that genuinely shares. Contact is the shortest station (115vh) so the pin window is
  only 15.2vh; the agent measured it and rebuilt the layout as a full-height
  space-between column until the child fit exactly 100vh, because the first attempt
  was 943px in a 900px viewport and clipped the eyebrow.

- [wave 4] 2026-09-22 — **all eight stations built, integrated and green.** Build,
  lint, typecheck and the full QA suite pass. Camera sweeps all eight with no
  discontinuity, every station within budget, zero console errors, zero failed
  requests, and the camera tracks the DOM at all six viewports from 390 to 2560.
  Six engine/design-system bugs were found by agents and fixed centrally rather than
  worked around: the vertex-shader prelude, the reduced-motion blur, the DOF focus
  default, `Card` clobbering its own styles, `CodeBlock` retyping, and the HUD judging
  co-mounted stations against a single budget.
  Nothing anyone reported needed a change to a file they did not own except those six.
- [P4] 2026-09-22 — done. Interaction layer and the composition pass.

  **Consolidation.** The three station-local hover stores (`useProjectHover`,
  `useSkillHover`, `useTileHover`) are folded into `store/useInteraction.ts` and
  deleted. The store is keyed by `{ station, id }` and exposes `hoveredIdIn(station)`
  for non-reactive reads inside `useFrame` — a hovered slab must never re-render its
  siblings. `CONTACT_TILE_IDS` moved to `scenes/contact/tiles.ts`, since it is data
  rather than state.

  **Interaction.** Custom cursor (10px dot damped at 18, 36px ring damped at 10 — the
  lag between them is the whole effect), driven declaratively by `data-cursor`
  attributes so no station carries cursor logic. Magnetic CTAs at strength 0.3.
  A 120ms brightness dip and 2px nudge on station arrival. Konami code pulses the hero
  monogram through the brand ramp for three seconds, and a console greeting. All of it
  disabled on coarse pointers and under reduced motion.

  **No audio.** A8 was never supplied and the brief is explicit: omit the system
  rather than ship a toggle that does nothing. There is no `lib/audio.ts` and no
  `SoundToggle`.

  **Composition pass — three real defects, all found by looking at frames:**
  1. *Hero.* The particle mark sat on top of "Milan Kumawat". Resized 4.9 → 3.1 and
     moved to x 1.52. At p=0 the camera is 4 units out at 62° fov, so only x −2.4..2.4
     is on screen and the headline column owns everything left of −0.2; the old mark
     spanned −1.3..3.6, overlapping the headline *and* running off the right edge.
     A first attempt at x 2.45 over-corrected and cropped the K.
  2. *How I Build bled into two stations.* Its blueprint floor was a 200×190 plane with
     a fade reaching 92 units, so it was still ~60% opaque at the Writing anchor and
     dominated that station's lower half. Now 96×88 with an 18→40 fade, and Build's
     `mountPadding` tightened to 0.035. Writing is clean and light again.
  3. *Projects rendered as a ~40px thumbnail strip.* Slabs scaled 1.35× and the arc
     step with them. A first attempt at 1.7× ran them off the top of the frame, and
     also deepened `SLAB_D` — which silently buried the screenshot plane inside the
     slab body, because `Slab.tsx` hardcodes `HALF_DEPTH = 0.03` against the original
     depth. The slabs rendered as blank grey panels. Depth reverted and the coupling
     is now commented at both ends.

  Full QA green. Build, lint, typecheck clean.
- [P5] 2026-09-22 — done. **First Load JS 636 kB → 528 kB**; excluding the three
  core chunks (which cache separately) the initial payload is 330 kB gzipped,
  against a 400 kB target.

  Two things produced it, and the second was the bigger surprise:
  1. **Code splitting.** Seven stations are now `lazy()` behind their manifest's
     import — that had to be the manifest, because `SceneDirector` consumes
     `manifest.Scene` and a static import there keeps every station in the entry
     graph no matter what the director does. Hero stays static: it renders at
     progress 0 and must not wait on a round trip. Verified in the network panel,
     one chunk per station arriving as its `mountPadding` window opens.
  2. **69 kB gzipped of dead `n8ao`.** `@react-three/postprocessing` ships a
     pre-bundled dist that imports `n8ao` at the top; the `<N8AO>` component
     tree-shakes but the package import does not, because `n8ao` never declares
     itself side-effect free. Every visitor was downloading an ambient-occlusion
     pass **with a base64 neural denoise model embedded in it**. Scoped
     `sideEffects: false` rule in `next.config.ts`.

  `scripts/check-budgets.mjs` is the standing gate — 12 assertions, all green,
  wired into CI. It takes its budget denominator from the HUD rather than a table of
  its own, so it cannot drift when someone tunes a `mountPadding`. It asserts no
  frame rate and says so in its own output.

  `scripts/optimize-assets.mjs` is a safe no-op today: writes nothing, exits 0, and
  prints all 22 empty slots grouped by priority with the spec, the consumer, and what
  ships instead. `sharp` is now installed, so the resize/encode path is live the
  moment files land.

  No GPU leak: geometries never grow across three full scroll cycles, and About and
  Skills each add exactly one texture on first visit and none after — the procedural
  portrait canvas and the runtime icon atlas being cached, which is correct.

  Skipped: `build-atlas.mjs`. It needs the Skills station to consume a baked atlas
  instead of building one at runtime, and shipping an unused 512×512 webp would be
  pure waste. It is the smallest item on the list (~80 ms).

- [P6] 2026-09-22 — done, and it found more than it was sent to find.

  **The no-WebGL path was functional but wrong, for a specific reason:**
  `SceneDirector` is the only thing that writes `--page-bg` and flips `data-theme`,
  and it lives inside the canvas. With no WebGL, `data-theme` stayed `"dark"` forever
  and all six light stations rendered dark tokens on near-black. `StaticBackdrop`
  now drives both from the same centre-to-centre blend the 3D uses, so a build with
  WebGL and one without change theme at identical scroll positions.

  **The page was unreadable with JavaScript disabled.** The server-rendered HTML
  carries 137 `opacity:0` and 113 `blur(6px)` inline styles — Motion's SSR "before"
  state. Crawlers got the text (verified by grepping `curl` output for strings from
  every station), but a human with JS off got a blank page behind a preloader that
  never resolved. A `<noscript>` stylesheet now releases all of it.

  **Keyboard navigation was measured, not reasoned about.** The naive
  "scroll to the station" approach left **46 of 120 tab stops below the fold**,
  because several stations have DOM taller than their sticky pin window. The fix
  probes the real layout — scroll, force a synchronous `getBoundingClientRect`,
  correct, up to four times, all before paint — then hands Lenis one smooth move.
  After it: 0 of 55 off-screen, and 0px of native scroll-into-view fighting Lenis
  across 55 consecutive tabs.

  **Two contrast failures, both fixed at the token:**
  - `--ink-400` `#6B7C93` measured **3.82:1** on the Writing background — `.t-meta`
    and `.t-eyebrow` are 12–13px so they need 4.5. Now `#5A6B83`, clearing 4.87 on
    the worst surface.
  - White on `--brand-400` in dark measured **3.68:1** — the primary pill label on
    the hero and the nav CTA. `--on-brand` in the dark block is now `#05080E`
    (5.45:1). Deliberately **not** fixed by darkening `--brand`, which would have
    broken the Contact eyebrow at 12px.

  Also: the a11y layer is mounted from `layout.tsx` rather than `page.tsx`, because
  the skip link and station nav must be the first two stops in the tab order and
  `page.tsx` renders after the preloader. Signed off.

- [main] 2026-09-22 — P5/P6 integration. Applied both contrast tokens,
  `outline-offset` 3px → 2px to match the design system, `role="list"` on all 34
  lists (Tailwind v4's preflight strips list semantics from every one of them, and
  Safari + VoiceOver honour that), `role="contentinfo"` on the footer, `role="group"`
  on the Skills cards, Escape-returns-focus plus a real focus trap in the mobile
  menu, and Projects' dead `View Project` links now match Writing's `aria-disabled`
  treatment.

  **Fixed the LCP dependency P5 found.** The hero headline could not reveal until the
  preloader lifted, and the preloader waited for the first WebGL frame — so Largest
  Contentful Paint was a function of GPU initialisation on every device (7.7s on a
  throttled software-rasterised run). The preloader now leaves on the content's
  schedule with only a 450 ms grace for the first frame, and the canvas fades itself
  in when it is ready. The world arriving a beat after the text reads as assembly,
  not as a wait.
