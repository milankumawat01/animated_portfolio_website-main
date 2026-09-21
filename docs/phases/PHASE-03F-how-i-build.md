# P3F — How I Build Station

**Mode:** parallel (batch 2) · **Depends on:** P2 · **Est:** 5h
**Scene spec:** `docs/03-SCENE-BIBLE.md` § 06 · **Copy:** `docs/06-CONTENT.md` § 06
**Data:** `src/data/process.ts`

Fully procedural — **no assets needed at all**. This phase can run even if Milan has
supplied nothing.

---

## Files you own

```
src/scenes/build/manifest.ts
src/scenes/build/Scene.tsx
src/scenes/build/NodeFrame.tsx
src/scenes/build/Conduit.tsx
src/scenes/build/BlueprintGrid.tsx
src/scenes/build/Glyphs.tsx
src/scenes/build/shaders/dash.vert  dash.frag  grid.frag
src/sections/Build.tsx
```

---

## Build order

1. **`BlueprintGrid.tsx`** — one large plane, procedural grid in `grid.frag` using
   `abs(fract(uv * N) - 0.5)` thresholded and anti-aliased with `fwidth`. Two line
   frequencies (major and minor). One draw call, looks infinite, zero texture memory.
   Build this first; it establishes the whole blueprint register.
2. **`NodeFrame.tsx`** — `EdgesGeometry` of a rounded box rendered as lines in
   `--ink-700`, with a blue fill plane at 8% opacity inside. An `active` prop flashes
   the edges to brand blue and brightens the fill.
3. **`Conduit.tsx`** — `TubeGeometry` between consecutive nodes. `dash.frag` renders
   a dashed pattern via `fract(vUv.x * 30.0 - uTime)`, and a `uDraw` uniform clips the
   tube by `vUv.x` so the conduit **draws itself on** as `progress` advances. This is
   the core effect — the diagram constructs itself as you scroll.
4. **`Glyphs.tsx`** — five instanced quads orbiting each node on local axes, carrying
   simple procedural glyph shapes drawn in the fragment shader. One `InstancedMesh`
   for all 25.
5. **`Scene.tsx`** — five nodes laid out along X from -14 to 14, conduits between them,
   grid below. Map `progress` so each node activates in sequence as the camera dollies
   past it. Camera motion comes from the manifest: a straight lateral dolly with a 4°
   look-ahead yaw — deliberately predictable, contrasting with the helix before it.
6. **`sections/Build.tsx`** — headline, intro, the `build.sh` `CodeBlock` with the
   typewriter prop, the "Small steps. Big products." badge, five step cards with their
   checklists, the four-value bottom bar, the quote card, two `Script` annotations.

---

## Quality tiers

| | low | medium | high |
|---|---|---|---|
| Dash animation | off (static dashes) | on | on |
| Draw-on | instant | on | on |
| Orbiting glyphs | off | on | on |
| Grid | on | on | on |

---

## Budget

**16 draw calls · 30k triangles.** Five conduits should share one material instance.

---

## Acceptance criteria

- [ ] The diagram visibly constructs itself as you scroll, and deconstructs on reverse
- [ ] Each node activates as the camera reaches it, not before or after
- [ ] The grid has no moiré at grazing angles — `fwidth` anti-aliasing is working
- [ ] Code block types out when the station activates and does not retype on re-entry
- [ ] Dashes flow toward the next node, not backwards
- [ ] `?q=low` shows a complete static wireframe that still reads as a pipeline
- [ ] Reduced motion: diagram appears complete, no dash flow, no orbit, no typewriter
- [ ] 60fps at `high`; record in `STATUS.md`

---

## Assets

**None.** Fully procedural. If you find yourself wanting an image, you are solving it
wrong — this station is meant to look drawn, not photographed.
