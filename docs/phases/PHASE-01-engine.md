# P1 — Core 3D Engine & Contracts

**Mode:** solo, blocking · **Depends on:** P0 · **Est:** 8h

**This is the most important phase in the project.** Everything after it runs in
parallel *because* this phase freezes the contracts. Take the time. If P1 is sloppy,
eight agents will each work around it differently and the codebase will fracture.

---

## Files you own

```
src/engine/Canvas.tsx  CameraRig.tsx  SceneDirector.tsx  PostFX.tsx
           Lighting.tsx  Preloader.tsx  DebugHUD.tsx  quality.ts  types.ts
src/store/useScroll.ts  useQuality.ts
src/lib/shader.ts  math.ts  curves.ts
src/scenes/index.ts              ← write once, then FROZEN FOREVER
src/scenes/<each of 8>/manifest.ts + Scene.tsx   ← stubs only
src/sections/index.ts            ← write once, then FROZEN FOREVER
src/sections/<each of 8>.tsx     ← stubs only
src/app/page.tsx                 ← replaces P0's placeholder
```

---

## Tasks

### 1. Types (`engine/types.ts`)
Implement `StationId`, `QualityTier`, `SceneManifest`, `SceneProps` exactly as
specified in `docs/02-ARCHITECTURE.md` §2. Do not add fields. Do not rename.

### 2. Scroll store (`store/useScroll.ts`)
- Lenis instance created once, `lerp: 0.085`, `wheelMultiplier: 1`, `smoothWheel: true`.
- Drive GSAP's ticker from Lenis's raf so ScrollTrigger and Lenis agree.
- Expose `progress` (0..1 of total scrollable height), a **damped signed `velocity`**
  normalized to roughly ±1, `direction`, `activeStation`, `localProgress`.
- `scrollTo(station)` resolves the station's `range[0]` to a pixel offset and calls
  `lenis.scrollTo`.
- Zustand store updated from the raf loop — but **throttle the store write**. Write
  `progress` every frame (cheap, selector-guarded) and `activeStation` only on change.

### 3. Quality (`engine/quality.ts` + `store/useQuality.ts`)
- Detect: `WEBGL_debug_renderer_info` renderer string, `navigator.deviceMemory`,
  `hardwareConcurrency`, touch-primary, and `prefers-reduced-motion`.
- Initial tier from heuristics, then a **live FPS probe** over the first 3s that can
  demote (never promote) the tier.
- Also expose `hasWebGL` and a clamped `dpr` per the table in
  `docs/02-ARCHITECTURE.md` §6.
- Allow `?q=low|medium|high` URL override for testing. This will be used constantly.

### 4. Camera path (`lib/curves.ts`)
- A `CatmullRomCurve3` through the eight station anchors from
  `docs/02-ARCHITECTURE.md` §4. Author the anchor coordinates here — they are
  authoritative, and manifests must agree with them.
- Export `getCameraAt(progress): { position, lookAt, fov }` which blends between the
  manifest keyframes of the surrounding stations. Look-at targets interpolate along
  their own secondary curve so the camera never snaps its gaze.
- Export `STATION_RANGES` so manifests import rather than duplicate the numbers.

### 5. Camera rig (`engine/CameraRig.tsx`)
- A `PerspectiveCamera` driven entirely from `useScroll().progress` through
  `getCameraAt`. Damp position and look-at with `MathUtils.damp` at ~6 so a flung
  scroll does not jerk the camera.
- Mouse parallax: additive offset, magnitude from a per-station value, damped at 0.06.
  Disabled under reduced motion and on touch.
- Roll and FOV also interpolate. FOV pumps by up to +3° with `|velocity|` — cheap,
  and it makes fast scrolling feel fast.

### 6. Scene director (`engine/SceneDirector.tsx`)
- Reads the registry, and for each manifest decides mounted / unmounted from
  `progress` against `range ± mountPadding`.
- Mounted scenes get `<Suspense>` and a `<group>` positioned at their station anchor,
  so scenes author in local coordinates.
- Cross-fades `environment.background` and fog between the two nearest stations and
  writes the resulting hex to a CSS variable `--page-bg` on `<html>`, plus sets
  `data-theme="dark|light"` at the midpoint of each transition. This is what keeps
  the DOM overlay in sync with the 3D.

### 7. Canvas + Post + Lighting
- `Canvas.tsx`: one `<Canvas>`, `dpr` from quality, `gl: { antialias: tier!=='low',
  powerPreference: 'high-performance' }`, `frameloop="always"`, fixed positioning,
  `pointer-events: none` by default (P3E re-enables it for drag).
- `PostFX.tsx`: `EffectComposer` with Bloom always, plus DOF and ChromaticAberration
  on `high`. Effects read per-station intensity from a small store the director
  writes, so stations can dial post FX without owning the composer.
- `Lighting.tsx`: one hemisphere + one directional key + one warm point (the lamp).
  Intensities interpolate per station from the manifest environment. Stations may add
  their own local lights but must keep the total light count ≤ 6.

### 8. Preloader (`engine/Preloader.tsx`)
- drei `useProgress`, a full-screen dark panel with the monogram outline stroking on
  and a percentage. Exits with a 600ms wipe once progress hits 100 **and** the first
  frame has rendered.
- Blocks scroll (`lenis.stop()`) until dismissed.

### 9. Debug HUD (`engine/DebugHUD.tsx`)
Rendered only when `?debug=1`. Shows: FPS, frame ms, draw calls, triangles, programs,
textures, current station, local progress, quality tier, and **red text when the
active station exceeds its manifest budget**. Every later phase depends on this to
self-verify, so make it accurate.

### 10. Eight stubs
For each station: a `manifest.ts` with real `range`, real `camera` keyframes matching
the curve, real `environment`, real `budget`, and a `Scene.tsx` that renders a single
labelled wireframe box. A matching `sections/<Name>.tsx` rendering just the eyebrow
and headline from `src/data`.

Then `scenes/index.ts`:
```ts
import { heroManifest } from './hero/manifest'
// ...all eight
export const scenes = [heroManifest, aboutManifest, /* ... */] as const
```
**Commit this file and never touch it again.**

### 11. `app/page.tsx`
```tsx
<Preloader />
<Canvas />        // fixed, z-0
<main>            // z-10
  {sections.map(S => <S key={...} />)}
</main>
<DebugHUD />
```

---

## Acceptance criteria

- [ ] Scrolling the full page moves the camera smoothly through all eight wireframe
      boxes with **no snap at any station boundary**
- [ ] Background colour and `data-theme` cross-fade correctly at every boundary
- [ ] `?q=low` visibly reduces DPR and disables post FX
- [ ] `?debug=1` reports plausible numbers and flags a deliberately over-budget stub
- [ ] `prefers-reduced-motion` disables parallax but scroll navigation still works
- [ ] Resizing the window does not break the camera or scroll mapping
- [ ] Preloader appears, completes, and releases scroll
- [ ] 60fps with all eight stubs — if the empty engine is not 60fps, nothing later will be
- [ ] `pnpm build` clean

---

## Assets

`monogram.svg` (A1) is 🟡 here — the Preloader uses it. Stub with a circle if absent.
