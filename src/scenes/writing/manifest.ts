import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { WritingScene } from './Scene'

export const writingManifest: SceneManifest = {
  id: 'writing',
  order: 7,
  range: [0.8, 0.91],
  camera: stationCamera('writing'),
  environment: {
    background: '#F7FAFD',
    fogColor: '#EBF2FA',
    fogNear: 10,
    fogFar: 100,
    theme: 'light',
  },
  Scene: WritingScene,
  budget: { drawCalls: 10, triangles: 20_000 },
}
