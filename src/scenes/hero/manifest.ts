import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { HeroScene } from './Scene'

export const heroManifest: SceneManifest = {
  id: 'hero',
  order: 1,
  range: [0.0, 0.11],
  camera: stationCamera('hero'),
  environment: {
    background: '#070B12',
    fogColor: '#070B12',
    fogNear: 6,
    fogFar: 40,
    theme: 'dark',
  },
  Scene: HeroScene,
  budget: { drawCalls: 24, triangles: 180_000 },
}
