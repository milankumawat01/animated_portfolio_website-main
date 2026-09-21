import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { SkillsScene } from './Scene'

export const skillsManifest: SceneManifest = {
  id: 'skills',
  order: 5,
  range: [0.55, 0.68],
  camera: stationCamera('skills'),
  environment: {
    background: '#F5F8FC',
    fogColor: '#E7EFF9',
    fogNear: 10,
    fogFar: 90,
    theme: 'light',
  },
  Scene: SkillsScene,
  budget: { drawCalls: 8, triangles: 25_000 },
}
