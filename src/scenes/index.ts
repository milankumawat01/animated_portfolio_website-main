import type { SceneManifest } from '@/engine/types'
import { heroManifest } from './hero/manifest'
import { aboutManifest } from './about/manifest'
import { projectsManifest } from './projects/manifest'
import { experienceManifest } from './experience/manifest'
import { skillsManifest } from './skills/manifest'
import { buildManifest } from './build/manifest'
import { writingManifest } from './writing/manifest'
import { contactManifest } from './contact/manifest'

/**
 * THE SCENE REGISTRY — written once in P1 and frozen.
 *
 * Every station's entry already exists and points at its own folder, so a station
 * agent never has to edit this file. That is the whole reason eight agents can work
 * at the same time without colliding. Do not add, reorder or remove entries.
 */
export const scenes: readonly SceneManifest[] = [
  heroManifest,
  aboutManifest,
  projectsManifest,
  experienceManifest,
  skillsManifest,
  buildManifest,
  writingManifest,
  contactManifest,
]

if (process.env.NODE_ENV === 'development') {
  // A seam means station N's camera.to drifted from station N+1's camera.from, which
  // shows up as the camera snapping as you cross the boundary.
  for (let i = 0; i < scenes.length - 1; i++) {
    const a = scenes[i]
    const b = scenes[i + 1]
    if (a.range[1] !== b.range[0]) {
      console.warn(`[scenes] scroll gap between ${a.id} and ${b.id}`)
    }
    const same =
      a.camera.to.position.every((v, k) => v === b.camera.from.position[k]) &&
      a.camera.to.lookAt.every((v, k) => v === b.camera.from.lookAt[k]) &&
      a.camera.to.fov === b.camera.from.fov
    if (!same) {
      console.warn(
        `[scenes] CAMERA SEAM between ${a.id} and ${b.id} — the camera will snap. ` +
          'Use stationCamera(id) from @/lib/curves instead of hand-writing keyframes.',
      )
    }
  }
}
