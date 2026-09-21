import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { BuildScene } from './Scene'

/**
 * 06 — HOW I BUILD.
 *
 * FOG. The default 12/120 hazed the drawing: this station is 28 world units wide
 * and the camera runs down its length from 55 units out, so with `fogNear` at 12
 * the far node sat under a permanent grey wash and the approach arrived out of a
 * cloud. Pushed to 24/170, and the fog colour pulled close to the background so
 * what is left reads as aerial perspective rather than weather. The blueprint
 * floor does its own distance fade in `grid.frag`, which is what actually keeps
 * the far field from turning into a moiré field.
 *
 * The camera block is `stationCamera('build')` and must stay that way — the
 * keyframes are derived in `lib/curves.ts` so the boundary with Skills and Writing
 * cannot drift.
 */
export const buildManifest: SceneManifest = {
  id: 'build',
  order: 6,
  range: [0.68, 0.8],
  camera: stationCamera('build'),
  environment: {
    background: '#F2F6FC',
    fogColor: '#E9F0F9',
    fogNear: 24,
    fogFar: 170,
    theme: 'light',
  },
  // Tight: the camera enters Writing still standing in this station's volume
  // (writing's first waypoint is world z -198, in front of this anchor at -210),
  // so a generous padding keeps the blueprint floor on screen well into Writing.
  mountPadding: 0.035,
  Scene: BuildScene,
  budget: { drawCalls: 16, triangles: 30_000 },
}
