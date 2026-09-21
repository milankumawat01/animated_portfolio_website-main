import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { ContactScene } from './Scene'

export const contactManifest: SceneManifest = {
  id: 'contact',
  order: 8,
  range: [0.91, 1.0],
  camera: stationCamera('contact'),
  environment: {
    background: '#05080E',
    fogColor: '#05080E',
    fogNear: 8,
    fogFar: 70,
    theme: 'dark',
  },
  Scene: ContactScene,
  budget: { drawCalls: 20, triangles: 70_000 },
}
