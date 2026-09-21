import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { lazy } from 'react'

/** CODE SPLIT (P5) — see the note in `scenes/about/manifest.ts`. */
const ExperienceScene = lazy(() =>
  import('./Scene').then((m) => ({ default: m.ExperienceScene })),
)

/**
 * 04 — EXPERIENCE. The camera block comes from `lib/curves` and is never
 * hand-written: this station's `to` IS skills' `from`, so a seam is impossible.
 *
 * FOG. The default 14/130 hazed the station badly, and for a reason specific to
 * this scene: it is the only one that is 18 units TALL as well as deep. At the
 * foot of the climb the crown of the helix is already ~20 units away, so a fog
 * that started at 14 greyed out the part of the tube the visitor is about to
 * travel — exactly the part that has to look inviting. Starting at 20 keeps the
 * whole filament crisp from either end while still giving the 240-unit ground
 * plane somewhere to disappear into by 150.
 *
 * The background stays on the design system's `--surface-page`. It is bright
 * enough that bloom has to be thresholded above it rather than below — see the
 * note in `Scene.tsx`.
 */
export const experienceManifest: SceneManifest = {
  id: 'experience',
  order: 4,
  range: [0.4, 0.55],
  camera: stationCamera('experience'),
  environment: {
    background: '#F5F8FC',
    fogColor: '#E0EAF7',
    fogNear: 20,
    fogFar: 150,
    theme: 'light',
  },
  Scene: ExperienceScene,
  // Five shader programs to compile (the tube's core and sheath differ by a
  // define, so they are two), two of them on 240-segment tubes. A little under
  // the 0.08 default is still ~19vh of warning before the camera arrives.
  mountPadding: 0.06,
  budget: { drawCalls: 12, triangles: 90_000 },
}
