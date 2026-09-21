# P3D — Experience Station

**Mode:** parallel (batch 2) · **Depends on:** P2 · **Est:** 5h
**Scene spec:** `docs/03-SCENE-BIBLE.md` § 04 · **Copy:** `docs/06-CONTENT.md` § 04
**Data:** `src/data/experience.ts`

The only station where the camera gains height. The camera path does most of the work
here, so keep the geometry calm.

---

## Files you own

```
src/scenes/experience/manifest.ts
src/scenes/experience/Scene.tsx
src/scenes/experience/Helix.tsx
src/scenes/experience/YearMarker.tsx
src/scenes/experience/Motes.tsx
src/scenes/experience/shaders/pulse.vert  pulse.frag  grid.frag
src/sections/Experience.tsx
```

---

## Build order

1. **`Helix.tsx`** — `TubeGeometry` on a `CatmullRomCurve3` sampled from a helix
   function: radius 4, rise 18 over three turns, 240 path segments, 8 radial, radius
   0.06. The shader draws a persistent dim base glow **plus** a travelling pulse whose
   position comes from a `uProgress` uniform bound to the station's `progress`. The
   pulse must lead the camera slightly — it should feel like the light is pulling you up.
2. **`YearMarker.tsx`** — a `TorusGeometry` ring in emissive brand blue at each of the
   three role heights, plus the year numerals. Use drei `<Text3D>` with the Satoshi
   typeface JSON if available; **if not, skip 3D text entirely and let the DOM card
   carry the year** — do not ship a mismatched fallback font. Rings rotate slowly and
   pulse on arrival (when the camera's `y` passes the marker).
3. **`Motes.tsx`** — 2,000 instanced points drifting downward with slight lateral
   noise. This is the cheapest and most effective "you are ascending" cue. One draw call.
4. **Ground grid** — a single plane far below with `grid.frag`: an anti-aliased
   procedural grid using `fwidth`, fading into the fog. No texture.
5. **`Scene.tsx`** — assembles the above. Camera `y` 0 → 18 and a 200° orbit come from
   the manifest keyframes, so just verify the geometry reads well along that path.
6. **`sections/Experience.tsx`** — the three timeline cards, each pinned so it is
   centred as the camera passes its year marker (derive from `localProgress` thresholds
   at roughly 0.15 / 0.48 / 0.82). Left rail with the three value `IconTile`s, the
   quote, two `Script` annotations.

---

## Quality tiers

| | low | medium | high |
|---|---|---|---|
| Tube segments | 80 | 160 | 240 |
| Pulse animation | static gradient | on | on |
| Motes | 200 | 1,000 | 2,000 |
| `Text3D` years | DOM labels | DOM labels | `Text3D` |
| Grid | on (cheap) | on | on |

---

## Budget

**12 draw calls · 90k triangles.** The tube is the bulk. If you exceed the triangle
budget, reduce radial segments before path segments — the silhouette matters more
than the cross-section.

---

## Acceptance criteria

- [ ] Scrolling reads unmistakably as climbing — verified by watching without the DOM
- [ ] The light pulse leads the camera and does not lag behind it
- [ ] Each timeline card is centred when its year marker is at eye level
- [ ] Year rings pulse on arrival
- [ ] No z-fighting between the tube and the rings
- [ ] `?q=low` still climbs and still reads
- [ ] Reduced motion: motes freeze, pulse becomes static, camera still climbs
- [ ] 60fps at `high`; record in `STATUS.md`

---

## Assets

- 🟡 **A6** `satoshi-bold.typeface.json` for `Text3D`. Generate it yourself from the
  woff2 via `facetype.js` if the font is present. Otherwise use DOM labels — that is
  an acceptable final state, not a stub.
