# P5 — Performance & Asset Pipeline

**Mode:** parallel with P6 · **Depends on:** P4 · **Est:** 5h

Make it fast, and make the asset pipeline reproducible. Runs alongside P6 — they touch
different files, but if you want hard isolation, dispatch this one with
`isolation: "worktree"`.

---

## Files you own

```
scripts/optimize-assets.mjs
scripts/build-atlas.mjs
scripts/check-budgets.mjs
public/**                      (generated output — yours to write)
src/engine/quality.ts          (tuning only — do not change its exported shape)
src/engine/AdaptiveQuality.tsx
next.config.ts                 (build-step additions only)
package.json                   (scripts section only)
```

---

## Tasks

### 1. Asset pipeline (`scripts/optimize-assets.mjs`)
Reads `assets/incoming/`, writes `public/`. Idempotent, runs in `prebuild`.
- Images → AVIF + WebP + JPG fallback, at 1x and 2x, via `sharp`.
- Project screenshots → max 2000px wide. Portraits → max 1600px.
- Emit a generated `src/data/assetManifest.ts` mapping logical names to real paths with
  width and height, so `next/image` gets dimensions without a runtime probe.
- **Warn loudly and list every missing 🔴 asset** from `docs/04-ASSET-MANIFEST.md` so a
  build never silently ships placeholders.

### 2. Icon atlas (`scripts/build-atlas.mjs`)
Move P3E's runtime atlas generation to build time. Emit `public/textures/tech-atlas.webp`
plus a UV lookup JSON. Saves ~80ms of main-thread work on every load.

### 3. Lazy scene loading
Split each station's `Scene` behind `next/dynamic` / `React.lazy` so a visitor who never
scrolls past the hero downloads only the hero's code. `SceneDirector` already mounts by
range; add the code-split boundary with a `Suspense` fallback of `null`.

**Verify with the network panel:** the initial JS payload should not contain the skills
force-layout or the projects transmission shader.

### 4. Adaptive quality (`src/engine/AdaptiveQuality.tsx`)
A rolling 60-frame FPS average. If it drops below 45 for two consecutive seconds,
demote the tier one step and show a one-time unobtrusive toast ("Reduced quality for
smoother performance"). **Never promote automatically** — oscillating quality is worse
than a low tier.

### 5. Texture and geometry budget
- Cap total GPU texture memory at ~150MB. Audit with the debug HUD's texture count.
- Ensure every custom material is disposed on unmount. Add a dev-only leak check that
  logs when `renderer.info.memory.geometries` grows across a full scroll cycle.
- Any station over its manifest budget: fix it, or negotiate the budget in `STATUS.md`
  with a written reason. Do not silently raise it.

### 6. `scripts/check-budgets.mjs`
A headless Playwright pass that scrolls the page at three tiers, samples
`renderer.info` at each station, and fails CI if a manifest budget is exceeded. This is
what keeps the site fast after you leave.

### 7. Loading experience
- Preload only hero-critical assets; everything else loads as its station approaches.
- `<link rel="preload">` the display font and the monogram.
- Target: LCP under 2.0s on a simulated Fast 3G with a 4x CPU throttle.

---

## Acceptance criteria

- [ ] `pnpm build` runs the asset pipeline and reports any missing 🔴 assets
- [ ] Initial JS bundle under 400KB gzipped, excluding the Three core chunk
- [ ] Three itself is in its own chunk and cached separately
- [ ] Lazy loading verified in the network panel — later stations load on approach
- [ ] Adaptive quality demotes under artificial load and does not oscillate
- [ ] No geometry or texture leak across three full scroll cycles
- [ ] `check-budgets` passes at all three tiers
- [ ] LCP under 2.0s throttled; record the number in `STATUS.md`
- [ ] 60fps desktop `high`, 30fps on a real mid-tier Android — **test on a real phone**

---

## Assets

Consumes everything in `assets/incoming/`. Does not require anything new.
