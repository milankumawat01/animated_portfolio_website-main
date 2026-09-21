# Architecture & Contracts

> **Every agent reads this before writing code.** The contracts below are what allow
> eight agents to work simultaneously without touching the same file.

---

## 1. Folder Structure

```
src/
  app/
    layout.tsx                 P0  root layout, fonts, metadata
    page.tsx                   P1  the single page: <Experience/> + <Content/>
    globals.css                P2  tokens + Tailwind layer
    fallback/page.tsx          P6  no-WebGL static version

  engine/                      P1 OWNS ALL OF THIS — nobody else edits
    Canvas.tsx                 the one persistent <Canvas>
    CameraRig.tsx              scroll-driven camera controller
    SceneDirector.tsx          mounts/unmounts stations by scroll range
    PostFX.tsx                 global postprocessing stack
    Lighting.tsx               global lights + environment
    Preloader.tsx              asset loading gate
    DebugHUD.tsx               ?debug=1 stats overlay
    quality.ts                 device tiering
    types.ts                   SceneManifest, StationId, QualityTier

  scenes/                      one folder per station, ONE OWNER EACH
    index.ts                   P1 ONLY — registry. Frozen after P1.
    hero/          P3A   Scene.tsx, materials.ts, shaders/*.glsl, manifest.ts
    about/         P3B   ...
    projects/      P3C   ...
    experience/    P3D   ...
    skills/        P3E   ...
    build/         P3F   ...
    writing/       P3G   ...
    contact/       P3H   ...

  sections/                    DOM overlay, one folder per station, same owners
    Hero.tsx       P3A
    About.tsx      P3B
    Projects.tsx   P3C
    Experience.tsx P3D
    Skills.tsx     P3E
    Build.tsx      P3F
    Writing.tsx    P3G
    Contact.tsx    P3H
    index.ts       P1 ONLY — frozen after P1

  components/
    ui/                        P2 OWNS — Button, Card, Chip, Eyebrow, Script,
                               Quote, IconTile, ArrowLink, StatBlock, SectionShell
    chrome/                    P2 OWNS — Nav, Footer, ScrollHint
    interaction/               P4 OWNS — Cursor, Magnetic, PageTransition, SoundToggle

  store/
    useScroll.ts               P1  scroll progress + velocity + active station
    useQuality.ts              P1  tier, reducedMotion, hasWebGL
    useInteraction.ts          P4  cursor state, hovered target, audio on/off

  data/
    profile.ts                 P0  name, role, location, links, stats
    projects.ts                P0  the four projects
    experience.ts              P0  the three roles
    skills.ts                  P0  six categories
    process.ts                 P0  five build steps
    articles.ts                P0  four articles
    All sourced from docs/06-CONTENT.md

  lib/
    shader.ts                  P1  GLSL import helper + noise chunk
    math.ts                    P1  lerp, damp, remap, clamp, easings
    curves.ts                  P1  the camera path (CatmullRom through 8 stations)

public/
  fonts/        P0    images/      user    models/     user (optional)
  textures/     user  audio/       user (optional)
```

---

## 2. THE SCENE MANIFEST CONTRACT

This is the single most important interface in the project. P1 defines it; every
station phase implements it. Defined in `src/engine/types.ts`:

```ts
export type StationId =
  | 'hero' | 'about' | 'projects' | 'experience'
  | 'skills' | 'build' | 'writing' | 'contact'

export type QualityTier = 'low' | 'medium' | 'high'

export interface SceneManifest {
  /** stable id, matches folder name */
  id: StationId
  /** 1-based display order */
  order: number
  /** scroll range this station occupies, 0..1 of total page progress */
  range: [number, number]
  /** camera keyframe at range start and range end, in world space */
  camera: {
    from: { position: [number, number, number]; lookAt: [number, number, number]; fov: number }
    to:   { position: [number, number, number]; lookAt: [number, number, number]; fov: number }
  }
  /** background + fog for this station; SceneDirector cross-fades between them */
  environment: {
    background: string        // hex
    fogColor: string
    fogNear: number
    fogFar: number
    theme: 'dark' | 'light'   // drives the DOM overlay colour scheme
  }
  /** the R3F subtree. Receives local progress 0..1 within its own range. */
  Scene: React.ComponentType<SceneProps>
  /** mount this station when scroll is within range ± this padding (0..1) */
  mountPadding?: number       // default 0.08
  /** hard budgets; DebugHUD flags violations */
  budget: { drawCalls: number; triangles: number }
}

export interface SceneProps {
  /** 0..1 progress within THIS station's range */
  progress: number
  /** true when this station is the active one */
  active: boolean
  /** current quality tier — you MUST branch on this */
  quality: QualityTier
  /** true when the user prefers reduced motion */
  reducedMotion: boolean
}
```

Each station folder exports exactly this shape from `manifest.ts`:

```ts
// src/scenes/hero/manifest.ts
import type { SceneManifest } from '@/engine/types'
import { HeroScene } from './Scene'

export const heroManifest: SceneManifest = {
  id: 'hero',
  order: 1,
  range: [0.000, 0.125],
  camera: { from: {...}, to: {...} },
  environment: { background: '#070B12', fogColor: '#070B12', fogNear: 6, fogFar: 40, theme: 'dark' },
  Scene: HeroScene,
  budget: { drawCalls: 24, triangles: 180_000 },
}
```

`src/scenes/index.ts` is written **once, in P1**, with all eight imports already in
place pointing at stubs. Station agents replace only the body of their own folder.
**This file is frozen. Do not edit it.**

---

## 3. Scroll Ranges (allocated in P1, frozen)

Total page height is `8 * 100vh * SECTION_SCALE` where `SECTION_SCALE = 1.6`.
Ranges are deliberately uneven — Projects and Experience get more scroll because
they have horizontal sub-motion.

| Station | Range | Share |
|---|---|---|
| hero | `0.000 – 0.110` | 11% |
| about | `0.110 – 0.230` | 12% |
| projects | `0.230 – 0.400` | 17% |
| experience | `0.400 – 0.550` | 15% |
| skills | `0.550 – 0.680` | 13% |
| build | `0.680 – 0.800` | 12% |
| writing | `0.800 – 0.910` | 11% |
| contact | `0.910 – 1.000` | 9% |

---

## 4. World Layout

The camera travels along a CatmullRom curve. Stations are laid out along -Z with
lateral offsets so the path curves rather than running straight — this makes the
travel legible.

```
        Y
        │      (04) experience  helix, y: 0 → 18
        │           ▲
  (05) skills ●     │
        │           │
        └───────────┼────────────────────────► X
                    │
   (01) hero      (02) about     (03) projects
   z = 0          z = -40        z = -85
   x = 0          x = 6          x = -4

   (06) build     (07) writing   (08) contact
   z = -210       z = -255       z = -300
   x = 10         x = -8         x = 0
```

Exact coordinates live in `src/lib/curves.ts`, authored in P1. Station agents build
their geometry **centred at their own station origin** and let `SceneDirector` place
the group. Never hardcode a world position — use local coordinates from `(0,0,0)`.

---

## 5. State Contracts

```ts
// store/useScroll.ts   (P1)
useScroll() => {
  progress: number          // 0..1 whole page
  velocity: number          // signed, normalized, damped
  direction: 1 | -1
  activeStation: StationId
  localProgress: number     // 0..1 within activeStation
  scrollTo(station: StationId): void
}

// store/useQuality.ts   (P1)
useQuality() => {
  tier: QualityTier
  reducedMotion: boolean
  hasWebGL: boolean
  dpr: number               // clamped device pixel ratio
  setTier(t: QualityTier): void   // used by the adaptive perf monitor
}
```

**Read these with selectors**, never destructure the whole store in a `useFrame`
component. Use `useScroll(s => s.velocity)`.

---

## 6. Quality Tiers

Determined in P1 by `engine/quality.ts` from GPU renderer string, `deviceMemory`,
`hardwareConcurrency`, and a live FPS probe over the first 3 seconds.

| | low | medium | high |
|---|---|---|---|
| DPR cap | 1.0 | 1.5 | 2.0 |
| Particles (hero) | 8k | 40k | 150k |
| Post FX | none | bloom | bloom + DOF + CA |
| Shadows | off | off | soft, 1 light |
| Transmission material | replaced by standard | 2 samples | 6 samples |
| Instanced graph nodes | 24 | 48 | 80 |

Every station agent must define what their scene does at `low`. A blank scene is
an acceptable `low` variant for decorative elements; a missing one is not.

---

## 7. Conventions

- **TypeScript strict.** No `any`. `unknown` + narrowing if you must.
- **Path alias `@/` → `src/`.**
- **Shaders** live in `scenes/<id>/shaders/*.glsl`, imported via the raw loader
  configured in P0. Uniform names prefixed `u`, varyings `v`, attributes `a`.
- **`useFrame` discipline.** Never allocate inside it. Hoist `new Vector3()` etc. to
  module scope or `useMemo`. Never call `setState` from it — mutate refs.
- **Materials** are created in `useMemo` and disposed in the cleanup. Use drei's
  `shaderMaterial` helper for custom ones.
- **Naming.** Components `PascalCase`, hooks `useCamelCase`, GLSL files `kebab-case`,
  data files `camelCase.ts`.
- **Commits.** One per phase minimum, prefixed `feat(p3a): ...`.

---

## 8. Definition of Done (applies to every phase)

- [ ] `pnpm build` passes with zero TS errors
- [ ] `pnpm lint` clean
- [ ] Runs at 60fps on desktop at the `high` tier, verified in the debug HUD
- [ ] Degrades visibly but correctly at `low`
- [ ] No console warnings or errors
- [ ] Draw calls and triangles within the phase budget
- [ ] `docs/STATUS.md` updated
