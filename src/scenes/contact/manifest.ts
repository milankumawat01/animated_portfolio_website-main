import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { lazy } from 'react'

/** CODE SPLIT (P5) — see the note in `scenes/about/manifest.ts`. */
const ContactScene = lazy(() => import('./Scene').then((m) => ({ default: m.ContactScene })))

/**
 * 08 — CONTACT. The bookend: dark again, warm lamp, quiet.
 *
 * `camera` stays `stationCamera('contact')` — station 07's `to` IS this station's
 * `from`, so the seam at the Writing boundary is structurally impossible rather
 * than something this file has to remember.
 *
 * FOG. The stub's 8 → 70 was authored before anything was in the scene and it put
 * the desk under a fifth of a fog veil at rest, which read as a dirty lens rather
 * than distance. The subject sits 19–21 units out at the end of the station and
 * roughly 65 out at the start, so 14 → 115 leaves the desk almost clear once you
 * have arrived and still swallows it on the approach — which is the whole point of
 * "far away and dim". Additive things (the shaft, the pool, the mark) opt out of
 * fog in their own materials; fogging light toward the background just greys it.
 *
 * `mountPadding` is under the 0.08 default so this station and Writing overlap for
 * less of the boundary. Neither is expensive, but the combined draw-call reading
 * the HUD shows there is the sum of both budgets and there is no reason to widen it.
 */
export const contactManifest: SceneManifest = {
  id: 'contact',
  order: 8,
  range: [0.91, 1.0],
  camera: stationCamera('contact'),
  environment: {
    background: '#05080E',
    fogColor: '#05080E',
    fogNear: 14,
    fogFar: 115,
    theme: 'dark',
  },
  Scene: ContactScene,
  mountPadding: 0.05,
  budget: { drawCalls: 20, triangles: 70_000 },
}
