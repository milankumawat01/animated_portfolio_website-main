# P4 — Interaction Layer & Polish

**Mode:** solo · **Depends on:** all P3 · **Est:** 6h

Everything that makes the site feel authored rather than assembled. This is also
where the local interaction stores that station agents created get consolidated.

---

## Files you own

```
src/store/useInteraction.ts
src/components/interaction/Cursor.tsx  Magnetic.tsx  StationTransition.tsx
                           SoundToggle.tsx  Konami.tsx  index.ts
src/lib/audio.ts
```

You may also make **small, surgical** edits to `src/sections/*.tsx` to wrap elements in
`<Magnetic>` and add `data-cursor` attributes. Nothing else outside your folder.

---

## Tasks

### 1. Consolidate `useInteraction`
Station agents were told to use a local store if this did not exist yet. Find those,
migrate them to the shared store, delete the local ones. Check `STATUS.md`
cross-phase requests for the list.

Shape:
```ts
useInteraction() => {
  hovered: { station: StationId; id: string } | null
  cursorVariant: 'default' | 'link' | 'drag' | 'view' | 'hidden'
  pointer: { x: number; y: number }      // normalized -1..1, damped
  audioEnabled: boolean
  setHovered(...): void
  setCursorVariant(...): void
}
```

### 2. Custom cursor
A 10px dot that damps toward the real pointer at 0.18, plus a 36px ring that damps at
0.10 — the lag between them is the whole effect. Variants:
- `link` — ring expands to 56px, dot hides
- `view` — ring expands and shows "VIEW" (project slabs)
- `drag` — ring shows a horizontal double-arrow (skills graph)
- `hidden` — over text inputs

Driven by `data-cursor` attributes so sections declare intent declaratively. Hide the
native cursor only on fine-pointer devices, and disable the whole system under reduced
motion and on touch.

### 3. Magnetic buttons
`<Magnetic strength={0.35}>` translates its child toward the pointer when within a
radius, with a spring return. Apply to the primary CTAs, the carousel nav circles, and
the nav links. Keep the strength low — magnetism that is too strong reads as broken.

### 4. Station transitions
A subtle full-screen effect as the camera crosses a station boundary: a 120ms
brightness dip plus a 2px vertical displacement on the DOM overlay, easing back out.
Sells the "arrival" without a loading interstitial. Suppress under reduced motion.

### 5. Sound (optional — skip entirely if A8 assets are absent)
- `lib/audio.ts`: a tiny Web Audio wrapper with a shared `AudioContext`, lazily created
  **on first user gesture**, never before.
- Ambient pad loop at low gain, ducking slightly during fast scroll.
- A soft tick on hover of interactive elements, a swell on station arrival.
- **Muted by default.** A `SoundToggle` in the nav persists the choice to
  `localStorage`. Never autoplay.
- If the audio files are not in `public/audio/`, do not render the toggle at all.

### 6. Easter eggs
- **Konami code** → the hero monogram briefly reforms wherever you are on the page and
  the particle colour cycles through the brand ramp for 3 seconds.
- **Console message** — a styled greeting with the GitHub link. Every developer who
  visits will open the console; give them something.
- Keep it to these two. More would be noise.

### 7. Scroll polish pass
Walk the entire page at `high`, `medium`, and `low`, and fix: any station boundary that
snaps, any DOM reveal that fires late, any element that overlaps the 3D badly at
1280×720 and 1920×1080 and 390×844.

---

## Acceptance criteria

- [ ] All local interaction stores are gone; only `useInteraction` remains
- [ ] Cursor variants change correctly across all eight stations
- [ ] Cursor and magnetism are fully disabled on touch and under reduced motion
- [ ] No `AudioContext` is created before a user gesture — verify in DevTools
- [ ] Sound is muted on first load and the preference persists
- [ ] Konami code works and does not break the scene state afterwards
- [ ] Full-page scroll at all three tiers with no visual breakage at three viewports
- [ ] `pnpm build` clean

---

## Assets

🟢 **A8 audio** — entirely optional. Omit the system rather than ship it silent.
