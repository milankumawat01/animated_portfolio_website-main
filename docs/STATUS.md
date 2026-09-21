# Build Status

> Live tracker. Agents update **only their own row**, and **append** to the log.
> Never rewrite another agent's line. See `docs/05-PARALLEL-PLAYBOOK.md` §5.

**Last updated:** 2026-09-22 — P0–P2 done. Wave 4 dispatching.

---

## Phase board

| Phase | Name | Status | Owner | Notes |
|---|---|---|---|---|
| P0 | Foundation & Scaffold | ✅ Done | main | Next 15.5.25 · R3F 9.7 · three 0.186 |
| P1 | Core 3D Engine & Contracts | ✅ Done | main | Contracts FROZEN. Registries sealed. |
| P2 | Design System & DOM Kit | ✅ Done | main | Kit complete. Import from `@/components/ui`. |
| P3A | Hero station | 🟦 In progress | agent | batch 1 |
| P3B | About station | ⬜ Not started | — | Blocked by P2 · batch 2 |
| P3C | Projects station | 🟦 In progress | agent | batch 1 |
| P3D | Experience station | ⬜ Not started | — | Blocked by P2 · batch 2 |
| P3E | Skills station | 🟦 In progress | agent | batch 1 |
| P3F | How I Build station | ⬜ Not started | — | Blocked by P2 · batch 2 |
| P3G | Writing station | ⬜ Not started | — | Blocked by P2 · batch 3 |
| P3H | Contact station | ⬜ Not started | — | Blocked by P3A + P3B · batch 3 |
| P4 | Interaction & Polish | ⬜ Not started | — | Blocked by all P3 |
| P5 | Performance & Assets | ⬜ Not started | — | Blocked by P4 |
| P6 | A11y, SEO, Fallback | ⬜ Not started | — | Blocked by P4 |
| P7 | QA & Deploy | ⬜ Not started | — | Blocked by P5 + P6 |

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
| hero | — / 24 | — / 180k | — | — |
| about | — / 14 | — / 60k | — | — |
| projects | — / 28 | — / 40k | — | — |
| experience | — / 12 | — / 90k | — | — |
| skills | — / 8 | — / 25k | — | — |
| build | — / 16 | — / 30k | — | — |
| writing | — / 10 | — / 20k | — | — |
| contact | — / 20 | — / 70k | — | — |

---

## Cross-phase requests

> Append only. Format: `- [from P3C → P2] need a <Chip variant="ghost"> — worked around with a local style.`

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
