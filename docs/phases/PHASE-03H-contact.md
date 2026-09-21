# P3H — Contact Station & Footer

**Mode:** parallel (batch 3, **last**) · **Depends on:** P2, **P3A**, **P3B** · **Est:** 5h
**Scene spec:** `docs/03-SCENE-BIBLE.md` § 08 · **Copy:** `docs/06-CONTENT.md` § 08

The bookend. This station consumes exports from two other stations, which is why it
runs last. **Verify both imports exist before you start.**

---

## Hard dependencies — check these first

```ts
import { MonogramPoints } from '@/scenes/hero/MonogramPoints'   // from P3A
import { createDeskGroup } from '@/scenes/about/desk'            // from P3B
```

If either is missing, **do not build a parallel implementation**. Stub with a
primitive (a sphere for the monogram, a box for the desk), file a cross-phase request
in `STATUS.md`, and finish everything else. A duplicated desk is worse than a stub.

---

## Files you own

```
src/scenes/contact/manifest.ts
src/scenes/contact/Scene.tsx
src/scenes/contact/LampCone.tsx
src/scenes/contact/GlassPanels.tsx
src/scenes/contact/shaders/cone.frag
src/sections/Contact.tsx      (includes the Footer, placed from components/chrome)
```

---

## Build order

1. **`LampCone.tsx`** — an open cylinder with an additive gradient shader, vertex-faded
   toward the tip, `depthWrite: false`. Two triangles of cost and it carries the entire
   mood of the station. Build it first and light the scene around it.
2. **Distant desk** — `createDeskGroup('low')` placed far and dim. Deliberately use the
   `low` variant regardless of tier: at this distance the detail is invisible and the
   savings are free.
3. **Monogram reform** — `<MonogramPoints count={heroCount * 0.3} dissolve={1 - p} />`
   placed small and off to the side. Running the hero's dissolve **in reverse** is what
   closes the loop narratively. Verify the reform completes by `p ≈ 0.7` so it is
   settled before the footer.
4. **`GlassPanels.tsx`** — four small glass panels floating behind where the DOM
   contact tiles sit. Each brightens when its DOM tile is hovered, via
   `useInteraction`. Share one material.
5. **`Scene.tsx`** — assembles the above. Camera does a long pull-back with a slight
   downward settle; the final 20% of `p` has almost no camera motion so the footer
   feels like solid ground.
6. **`sections/Contact.tsx`** — split layout: left is the headline, body, four contact
   `IconTile` rows and the `Let's Talk →` CTA with its aside; right is the dark bleed
   where the 3D shows through unobstructed. The "Same Developer. Bigger Things Ahead."
   floating card. Two `Script` annotations. Then `<Footer />` from
   `components/chrome`, inside this station's shell.

---

## Quality tiers

| | low | medium | high |
|---|---|---|---|
| Distant desk | off | on | on |
| Monogram reform | off | 8k points | 45k points |
| Lamp cone | on | on | on |
| Glass panels | flat planes | glass | glass |

---

## Budget

**20 draw calls · 70k triangles.**

---

## Acceptance criteria

- [ ] `MonogramPoints` and `createDeskGroup` are **imported, not reimplemented**
- [ ] The monogram reforms in reverse and settles before the footer is reached
- [ ] Theme flips back to dark cleanly at the station boundary, and the DOM follows
- [ ] All four contact links work: `mailto:`, LinkedIn, GitHub, and the resume PDF
      downloads with the correct filename
- [ ] Hovering a contact tile brightens its 3D panel
- [ ] The footer sits on solid ground — no camera drift while reading it
- [ ] `?q=low` renders the lamp cone and a dark gradient; still feels intentional
- [ ] Reduced motion: monogram appears already formed, no drift
- [ ] 60fps at `high`; record in `STATUS.md`

---

## Assets

- 🔴 **A7 `Milan_Kumawat_Resume.pdf`** — the download link must work.
- 🟡 **A9** confirm `hey@milankumawat.in` is live before shipping the `mailto:`.
- Reuses A1 and A2 via the imported modules. No new assets.
