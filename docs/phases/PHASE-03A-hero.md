# P3A — Hero Station

**Mode:** parallel (batch 1) · **Depends on:** P2 · **Est:** 5h
**Scene spec:** `docs/03-SCENE-BIBLE.md` § 01 — read it fully before starting.
**Copy:** `docs/06-CONTENT.md` § 01 · **Data:** `src/data/profile.ts`

---

## Files you own

```
src/scenes/hero/manifest.ts          (P1 stubbed it — fill in, keep range/camera)
src/scenes/hero/Scene.tsx
src/scenes/hero/MonogramPoints.tsx   ← EXPORTED, consumed by P3H
src/scenes/hero/FogVolume.tsx
src/scenes/hero/lib/sampleMonogram.ts
src/scenes/hero/shaders/points.vert  points.frag  fog.frag
src/sections/Hero.tsx
```

**Do not edit** `src/scenes/index.ts`, anything in `src/engine/`, or `components/ui/`.

---

## Build order

1. **`sampleMonogram.ts`** first — everything depends on the target buffer. Load
   `/monogram.svg`, sample its path into N points using rejection sampling against
   the fill, extrude on Z with jitter, return a `Float32Array`. Cache the result in
   a module-level memo keyed by count. If the SVG is missing, fall back to sampling
   a torus knot so the scene still runs.
2. **`MonogramPoints.tsx`** — the particle system. Two position attributes (free +
   target), one `dissolve` uniform, curl noise in the vertex shader, soft radial
   sprite in the fragment shader, additive blending, `depthWrite: false`.
   **Public API, required by P3H:**
   ```tsx
   <MonogramPoints count={number} dissolve={0..1} scale={number} color={string} />
   ```
   Keep it free of `useScroll` — the parent passes `dissolve`. That is what lets
   Contact reuse it in reverse.
3. **`FogVolume.tsx`** — large inverted sphere, noise-scrolling fragment shader,
   `side: BackSide`, 8% opacity.
4. **`Scene.tsx`** — composes the above, maps `progress` to `dissolve` with a
   left-to-right sweep offset, adds the drifting dust quads, sets per-station post FX
   intensity (bloom 0.9 / threshold 0.75, chromatic aberration scaled by `|velocity|`).
5. **`sections/Hero.tsx`** — DOM overlay with `SectionShell`, `Reveal words` headline,
   stat block, tech strip via `TechLogo`, both CTAs, `ScrollHint`.

---

## Quality tiers

| | low | medium | high |
|---|---|---|---|
| Particle count | 8,000 | 40,000 | 150,000 |
| Fog volume | off | on | on |
| Dust quads | off | 2 | 4 |
| Post FX | none | bloom | bloom + CA |

---

## Budget

**24 draw calls · 180k triangles.** Verify with `?debug=1`.
The particle system must be **one** draw call. If it is more, you built it wrong.

---

## Acceptance criteria

- [ ] At `progress=0` the monogram is legible as "MK" from the camera's start position
- [ ] The dissolve sweeps left-to-right and frays rather than wiping
- [ ] Scrolling fast visibly smears the chromatic aberration
- [ ] `MonogramPoints` is exported and works standalone with a `dissolve` prop —
      **test it in isolation, P3H depends on this**
- [ ] Mouse parallax reads without making the monogram wobble
- [ ] `?q=low` still shows a recognizable constellation at 8k points
- [ ] Reduced motion: no idle drift, no CA, dissolve still follows scroll
- [ ] 60fps at `high` on desktop; measure and record in `STATUS.md`

---

## Assets

- 🔴 **A1 `monogram.svg`** — blocking for the real look. Torus-knot fallback exists.
- 🟡 A5 tech logos for the strip — `simple-icons` covers most.
