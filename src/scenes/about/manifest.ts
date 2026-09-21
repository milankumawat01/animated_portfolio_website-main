import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { AboutScene } from './Scene'

export const aboutManifest: SceneManifest = {
  id: 'about',
  order: 2,
  range: [0.11, 0.23],
  camera: stationCamera('about'),
  environment: {
    background: '#F5F8FC',
    fogColor: '#E6EEF8',
    fogNear: 10,
    fogFar: 90,
    theme: 'light',
  },
  Scene: AboutScene,
  budget: { drawCalls: 14, triangles: 60_000 },
}
