# P3G — Writing Station

**Mode:** parallel (batch 3) · **Depends on:** P2 · **Est:** 4h
**Scene spec:** `docs/03-SCENE-BIBLE.md` § 07 · **Copy:** `docs/06-CONTENT.md` § 07
**Data:** `src/data/articles.ts`

The lightest 3D station. Airy, weightless, a breather before the Contact bookend.

---

## Files you own

```
src/scenes/writing/manifest.ts
src/scenes/writing/Scene.tsx
src/scenes/writing/Sheet.tsx
src/scenes/writing/SheetField.tsx
src/scenes/writing/shaders/curl.vert  paper.frag
src/sections/Writing.tsx
```

---

## Build order

1. **`curl.vert`** — the whole station lives or dies on this shader. `PlaneGeometry`
   at 24×16 segments; apply a sine curl along X modulated by noise along Y, plus a
   per-sheet phase offset from an instance attribute. The sheet should bend like paper
   falling, not ripple like cloth — keep the amplitude low and the wavelength long.
2. **`paper.frag`** — two-sided with a subtle back-face tint (darker, desaturated) so
   the flutter is legible when a sheet turns over. Slight edge darkening sells the
   paper stock.
3. **`Sheet.tsx`** — a single textured sheet for the four featured articles.
4. **`SheetField.tsx`** — 14 blank sheets as one `InstancedMesh` sharing the shader,
   with per-instance phase, scale, and rotation. One draw call.
5. **`Scene.tsx`** — sheets travel toward the camera on Z at a rate tied to `progress`,
   wrapping when they pass behind. **Scroll direction reverses their travel** — a
   small detail that makes the station feel physically connected to the input. Near-DOF
   so passing sheets go soft as they exit frame (`high` only).
6. **`sections/Writing.tsx`** — headline, intro, the side note, `View all articles →`,
   `CarouselNav`, four article `Card`s with category `Chip`, date, title, excerpt and
   `Read Article →`, then the closing quote and a `Script` annotation.

---

## Quality tiers

| | low | medium | high |
|---|---|---|---|
| Blank sheets | 0 | 8 | 14 |
| Curl animation | off — static tilt | on | on |
| Featured sheets | 4 static | 4 animated | 4 animated |
| Near-DOF | off | off | on |

---

## Budget

**10 draw calls · 20k triangles.** Four textured sheets + one instanced field +
background. If the blank field is more than one draw call, instance it properly.

---

## Acceptance criteria

- [ ] Sheets read as paper — bending, not waving
- [ ] Scrolling up reverses the sheets' travel direction
- [ ] The four featured covers are legible as they pass the camera
- [ ] No sheet ever clips through the camera near plane
- [ ] Back faces are visibly tinted when a sheet turns
- [ ] `?q=low` shows four static tilted sheets that still compose well
- [ ] Reduced motion: sheets hold position, no curl, no drift
- [ ] 60fps at `high`; record in `STATUS.md`

---

## Assets

- 🟡 **A4 four `article-*.jpg`** — non-blocking. If absent, generate placeholder covers
  procedurally: a brand-gradient plane with the category name rendered via canvas
  texture. Note the substitution in `STATUS.md`.
- 🟡 **A9** real article URLs. Link to `#` and mark `aria-disabled` if not supplied.
