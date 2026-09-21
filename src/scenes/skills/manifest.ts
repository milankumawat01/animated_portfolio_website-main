import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { SkillsScene } from './Scene'

/**
 * 05 — SKILLS. The camera block is derived from `lib/curves`, never hand-written.
 *
 * The fog is pushed further out than the P1 default: the graph sits 9–21 units from
 * a camera that only travels from ~17 to ~12.5, and a fog that started at 10 turned
 * the far half of the graph into haze. Near 16 keeps the nodes crisp and still gives
 * the hand-off to Build somewhere to fade into.
 */
export const skillsManifest: SceneManifest = {
  id: 'skills',
  order: 5,
  range: [0.55, 0.68],
  camera: stationCamera('skills'),
  environment: {
    background: '#F5F8FC',
    fogColor: '#E7EFF9',
    fogNear: 16,
    fogFar: 110,
    theme: 'light',
  },
  Scene: SkillsScene,
  // Three draw calls of shader that has to compile before the station is on screen;
  // a touch under the 0.08 default is still ~13vh of warning.
  mountPadding: 0.06,
  budget: { drawCalls: 8, triangles: 25_000 },
}
