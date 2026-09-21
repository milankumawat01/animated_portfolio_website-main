import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { BuildScene } from './Scene'

export const buildManifest: SceneManifest = {
  id: 'build',
  order: 6,
  range: [0.68, 0.8],
  camera: stationCamera('build'),
  environment: {
    background: '#F2F6FC',
    fogColor: '#E3EAF3',
    fogNear: 12,
    fogFar: 120,
    theme: 'light',
  },
  Scene: BuildScene,
  budget: { drawCalls: 16, triangles: 30_000 },
}
