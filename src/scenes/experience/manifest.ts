import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { ExperienceScene } from './Scene'

export const experienceManifest: SceneManifest = {
  id: 'experience',
  order: 4,
  range: [0.4, 0.55],
  camera: stationCamera('experience'),
  environment: {
    background: '#EEF3FA',
    fogColor: '#DBE6F4',
    fogNear: 14,
    fogFar: 130,
    theme: 'light',
  },
  Scene: ExperienceScene,
  budget: { drawCalls: 12, triangles: 90_000 },
}
