import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { ProjectsScene } from './Scene'

export const projectsManifest: SceneManifest = {
  id: 'projects',
  order: 3,
  range: [0.23, 0.4],
  camera: stationCamera('projects'),
  environment: {
    background: '#F5F8FC',
    fogColor: '#E4ECF7',
    fogNear: 12,
    fogFar: 110,
    theme: 'light',
  },
  Scene: ProjectsScene,
  budget: { drawCalls: 28, triangles: 40_000 },
}
