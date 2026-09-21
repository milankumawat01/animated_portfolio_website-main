# P3E — Skills Station

**Mode:** parallel (batch 1) · **Depends on:** P2 · **Est:** 5h
**Scene spec:** `docs/03-SCENE-BIBLE.md` § 05 · **Copy:** `docs/06-CONTENT.md` § 05
**Data:** `src/data/skills.ts`

The only directly manipulable station, and a deliberate rest beat for the camera after
four stations of travel.

---

## Files you own

```
src/scenes/skills/manifest.ts
src/scenes/skills/Scene.tsx
src/scenes/skills/Graph.tsx
src/scenes/skills/lib/forceLayout.ts
src/scenes/skills/lib/atlas.ts
src/scenes/skills/shaders/edge.vert  edge.frag  node.vert  node.frag
src/sections/Skills.tsx
```

---

## Build order

1. **`forceLayout.ts`** — a small 3D force simulation: repulsion between all nodes,
   spring attraction along edges, weak centring force. Run **200 iterations once at
   mount**, then freeze and cache the result. Never simulate per frame. Six category
   hubs, 36 leaf nodes. Seed the RNG so the layout is identical on every load.
2. **`atlas.ts`** — build a 512×512 texture atlas from the `simple-icons` SVG paths at
   run time via an offscreen canvas (6×6 grid, 85px cells). Cache it. This avoids
   shipping 36 image files and keeps the sprite nodes to one draw call.
3. **`Graph.tsx`**
   - Nodes: one `InstancedMesh` of icosahedrons (the spheres) + one `InstancedMesh` of
     billboarded quads sampling the atlas. **Two draw calls for all nodes.**
   - Edges: a single `LineSegments` with vertex colours and a dash-offset shader so
     energy flows toward the hubs.
   - Highlight: an instanced attribute `aHighlight` 0..1 per node. Hovering a DOM
     category card sets it to 1 for that cluster and desaturates everything else to
     20%. Animate the attribute, do not rebuild the mesh.
4. **Drag-orbit.** A pointer handler on the canvas (you will need `pointer-events:
   auto` on the canvas **only while this station is active** — set it from your Scene's
   mount/unmount, and restore it on unmount). Inertia on release, clamped to ±35° so
   the composition cannot be lost, returning to idle rotation after 2s of no input.
5. **`sections/Skills.tsx`** — headline, intro, six category `Card`s each with a
   `TechLogo` row, the `workspace.jpg` side card with the "Always learning / Always
   building" badge, the kicker, the quote, two `Script` annotations.

---

## Quality tiers

| | low | medium | high |
|---|---|---|---|
| Nodes | 24 (hubs + top leaves) | 48 | 80 |
| Atlas sprites | off — coloured spheres | on | on |
| Edge dash animation | off | on | on |
| Drag-orbit | off | on | on |

---

## Budget

**8 draw calls · 25k triangles.** This is the tightest budget on the site and it is
achievable: 2 node calls + 1 edge call + background. If you exceed it you are not
instancing.

---

## Acceptance criteria

- [ ] Graph layout is stable and identical across reloads (seeded RNG)
- [ ] Force simulation runs once — verify it is not in `useFrame`
- [ ] Hovering a DOM category highlights exactly that cluster
- [ ] Drag-orbit feels weighted, has inertia, clamps, and returns to idle
- [ ] Canvas `pointer-events` is restored when the station unmounts — **verify by
      scrolling away and confirming the rest of the page still scrolls normally**
- [ ] `?q=low` shows a readable 24-node graph
- [ ] Reduced motion: no idle rotation, no dash flow; drag still allowed
- [ ] 60fps at `high`; record in `STATUS.md`

---

## Assets

- 🟡 **A5** — `simple-icons` covers most marks. Use P0's gap list; render a lettered
  tile for any mark still missing.
- 🟡 **A2 `workspace.jpg`** for the side card. Placeholder acceptable.
