# P3B — About Station

**Mode:** parallel (batch 2) · **Depends on:** P2 · **Est:** 5h
**Scene spec:** `docs/03-SCENE-BIBLE.md` § 02 · **Copy:** `docs/06-CONTENT.md` § 02

---

## Files you own

```
src/scenes/about/manifest.ts
src/scenes/about/Scene.tsx
src/scenes/about/desk.ts             ← EXPORTED, consumed by P3H
src/scenes/about/Portrait.tsx
src/scenes/about/ScreenTexture.ts
src/scenes/about/Plant.tsx
src/sections/About.tsx
```

---

## Build order

1. **`desk.ts`** — the reusable desk builder. **This is P3H's dependency, so build it
   first and keep it decoupled from React state.**
   ```ts
   export function createDeskGroup(quality: QualityTier): THREE.Group
   ```
   Composed from `RoundedBox` / cylinder / icosahedron primitives: desk surface,
   monitor, laptop, mug, plant pot, book stack, lamp, phone, notebook. Three shared
   materials only (matte plastic, dark screen, warm wood) so the whole desk merges
   into ~3 draw calls. No GLB, no external model.

2. **`ScreenTexture.ts`** — a `CanvasTexture` that draws scrolling code-like bars in
   brand blue. **Redraw at 12fps, not 60** — use an accumulator in `useFrame`. Two
   instances: monitor and laptop, different seeds.

3. **`Plant.tsx`** — `InstancedMesh` of 40 leaf quads with a gentle vertex sway in a
   custom shader. One draw call.

4. **`Portrait.tsx`** — rounded plane with `portrait.jpg`, floating in front of the
   desk. `high`: a `MeshTransmissionMaterial` frame around it so edges refract.
   `medium`: tinted standard material. `low`: plain textured plane.

5. **`Scene.tsx`** — assembles the desk, staggers each object's scale-in from 0 driven
   by `progress` with an overshoot ease, and places the portrait. Objects should
   *arrive* between `p` 0.05 and 0.45, then settle.

6. **`sections/About.tsx`** — headline, bio, three trait `IconTile`s, the four-card
   "What I work on" rail, the `Jaipur, India` pin, the quote, two `Script` annotations.

---

## Quality tiers

| | low | medium | high |
|---|---|---|---|
| Screen textures | static single frame | animated 12fps | animated 12fps |
| Plant sway | off | on | on |
| Portrait material | plain | tinted glass | transmission |
| Object stagger | instant | full | full |

---

## Budget

**14 draw calls · 60k triangles.** The desk must stay under 6 draw calls — if it is
more, your materials are not shared.

---

## Acceptance criteria

- [ ] `createDeskGroup(quality)` is exported, returns a `THREE.Group`, and works when
      called outside React — **P3H depends on this, test it standalone**
- [ ] Desk objects stagger in and land with a subtle overshoot
- [ ] Camera orbit reads as circling the desk, not sliding past it
- [ ] Screen textures animate but do not spike frame time (check the HUD's ms)
- [ ] Portrait degrades cleanly across all three tiers
- [ ] Reduced motion: objects appear without stagger, no plant sway, no screen animation
- [ ] 60fps at `high`; record in `STATUS.md`

---

## Assets

- 🔴 **A2 `portrait.jpg`** — blocking for the real look. Use a grey placeholder plane
  if absent and note it in `STATUS.md`.
- 🟢 `portrait-cutout.png` enables a nicer layered depth effect if supplied.
