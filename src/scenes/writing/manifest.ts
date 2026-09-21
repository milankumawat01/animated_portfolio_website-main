import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { WritingScene } from './Scene'

/**
 * 07 — WRITING.
 *
 * BACKGROUND. Deliberately a shade deeper and cooler than the design system's
 * `--surface-page`. The whole station is white paper, rendered through ACES, on a
 * background colour that is not tone mapped at all — at #F7FAFD the sheets came
 * out DARKER than the sky behind them and the station read as grey rectangles on
 * white. #EDF3FB is still unmistakably a light station and gives the stock
 * somewhere to sit.
 *
 * FOG. Much tighter than the other light stations, and that is correct here
 * rather than an oversight: the sheets live between 0 and 46 units of the lens
 * and nothing else is in the scene, so the fog is not aerial perspective over a
 * set — it is the only depth cue the station has. 14/78 leaves the readable band
 * (8–24 units) untouched and dissolves the far end of the corridor into the sky,
 * which is what makes the sheets look like they are falling out of somewhere.
 *
 * MOUNT PADDING. Below the 0.08 default on purpose. The field carries itself with
 * the lens, so while it is mounted it is always in front of the camera — including
 * when the camera is still in How I Build. `Scene.tsx` fades it in at 0.786 and
 * out by 0.918; 0.045 of padding is enough to have the shaders compiled before
 * either edge and not a scroll more.
 *
 * The camera block is `stationCamera('writing')` and must stay that way — the
 * keyframes are derived in `lib/curves.ts` so the boundaries with How I Build and
 * Contact cannot drift.
 */
export const writingManifest: SceneManifest = {
  id: 'writing',
  order: 7,
  range: [0.8, 0.91],
  camera: stationCamera('writing'),
  environment: {
    background: '#EDF3FB',
    fogColor: '#E7EFF9',
    fogNear: 14,
    fogFar: 78,
    theme: 'light',
  },
  Scene: WritingScene,
  mountPadding: 0.045,
  budget: { drawCalls: 10, triangles: 20_000 },
}
