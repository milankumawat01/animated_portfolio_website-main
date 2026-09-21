# P3C — Projects Station

**Mode:** parallel (batch 1) · **Depends on:** P2 · **Est:** 5h
**Scene spec:** `docs/03-SCENE-BIBLE.md` § 03 · **Copy:** `docs/06-CONTENT.md` § 03
**Data:** `src/data/projects.ts`

The most kinetic station, and the most fill-rate expensive. Watch GPU frame time, not
triangle count.

---

## Files you own

```
src/scenes/projects/manifest.ts
src/scenes/projects/Scene.tsx
src/scenes/projects/Slab.tsx
src/scenes/projects/Caustics.tsx
src/scenes/projects/shaders/ripple.vert  caustics.frag
src/sections/Projects.tsx
```

---

## Build order

1. **`Slab.tsx`** — `RoundedBox` 1.6 × 1.0 × 0.06 with `MeshTransmissionMaterial`
   (thickness 0.3, roughness 0.05, chromaticAberration 0.04, `samples` from tier).
   The project screenshot sits on a plane inset 0.04 **in front**, so it reads as
   being behind glass when viewed through the slab body. The image plane uses
   `ripple.vert` — vertex displacement scaled by `|velocity|` so fast scrolling makes
   the image undulate.
2. **`Caustics.tsx`** — a plane under each slab with an animated voronoi fragment
   shader, additive, 30% opacity. One shared material across all four; instance the
   planes. `high` and `medium` only.
3. **`Scene.tsx`** — four slabs on a shallow arc. Map `progress` to arc rotation so a
   full station scroll traverses three slab positions. Active slab: scale 1.08, lift
   0.3, tilt to face camera. Set per-station DOF with focus locked to the active slab.
4. **Hover wiring.** Read `useInteraction().hovered` (P4 owns the store, but P1 stubs
   the hook — check; if `useInteraction` does not exist yet, use a **local** Zustand
   store in your folder and file a cross-phase request so P4 migrates it). On hover:
   slab tilts up to 6° toward the cursor, rim light and emissive lift.
5. **`sections/Projects.tsx`** — headline, intro, `CarouselNav`, four `Card`s aligned
   horizontally with the slabs. Hovering a card drives the slab and vice versa.
   Footer line + `Always building ●` pulse.

---

## Quality tiers

| | low | medium | high |
|---|---|---|---|
| Slab material | opaque standard + emissive map | transmission, 2 samples | transmission, 6 samples |
| Caustics | off | on | on |
| Ripple on scroll | off | on | on |
| DOF | off | off | on |

---

## Budget

**28 draw calls · 40k triangles.** Transmission renders the scene to a buffer per
material — **share one material instance across all four slabs** or you pay four
times. This is the single most important perf decision in this phase.

---

## Acceptance criteria

- [ ] Scrolling the station advances the carousel smoothly with no snapping
- [ ] Project screenshots are legible through the glass, not washed out
- [ ] Hovering a DOM card visibly affects its 3D slab, and vice versa
- [ ] DOF focus tracks the active slab
- [ ] `?q=low` renders four readable opaque cards — still looks intentional
- [ ] Reduced motion: no ripple, no idle drift, carousel still scroll-driven
- [ ] GPU frame time under 8ms at `high` on desktop; record in `STATUS.md`

---

## Assets

- 🔴 **A3 four `project-*.png`** — blocking. Use flat brand-gradient placeholders with
  the project name if absent, and note it in `STATUS.md`.
- 🟡 A3 per-project logo marks for the card headers.
