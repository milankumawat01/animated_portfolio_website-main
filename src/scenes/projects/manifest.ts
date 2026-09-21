import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { lazy } from 'react'

/** CODE SPLIT (P5) — see the note in `scenes/about/manifest.ts`. */
const ProjectsScene = lazy(() =>
  import('./Scene').then((m) => ({ default: m.ProjectsScene })),
)

/**
 * 03 · PROJECTS — the lightest and most specular station.
 *
 * `camera` stays derived from `curves.ts`: the path is authoritative there and a
 * hand-written keyframe here would open a seam at the About and Experience
 * boundaries.
 *
 * `mountPadding` is tighter than the 0.08 default on purpose. The shared
 * transmission material renders the scene into an FBO on every frame it is mounted,
 * whether or not the camera is looking at it, so the station should not be alive for
 * any longer than it needs to be. 0.05 is still ~64vh of lead time — the slabs are
 * warmed up and rippling well before the camera turns onto them.
 */
export const projectsManifest: SceneManifest = {
  id: 'projects',
  order: 3,
  range: [0.23, 0.4],
  camera: stationCamera('projects'),
  environment: {
    background: '#F5F8FC',
    fogColor: '#E4ECF7',
    // Pushed out from 12/110: the camera enters the station ~27 units from the arc
    // and the glass has to stay crisp on approach, not arrive out of a haze.
    fogNear: 16,
    fogFar: 130,
    theme: 'light',
  },
  Scene: ProjectsScene,
  mountPadding: 0.05,
  budget: { drawCalls: 28, triangles: 40_000 },
}
