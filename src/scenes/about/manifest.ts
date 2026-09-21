import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { AboutScene } from './Scene'

/**
 * 02 · ABOUT — the first light station, and the first object on the site with a
 * silhouette.
 *
 * `camera` stays derived from `lib/curves`. Hand-writing keyframes here would open
 * a seam at both the Hero and the Projects boundary, since this station's `to` IS
 * Projects' `from`.
 *
 * FOG. The P1 default of 10/90 put the whole desk inside the ramp: the camera
 * enters this station 22 units from the desk and leaves 9 units from it, so at 10
 * the far legs and the plant were already hazing on arrival and the assembly read
 * as a smudge rather than as objects landing. 17/130 keeps the desk crisp for the
 * whole orbit and still gives the hand-off to Projects somewhere to fade into.
 */
export const aboutManifest: SceneManifest = {
  id: 'about',
  order: 2,
  range: [0.11, 0.23],
  camera: stationCamera('about'),
  environment: {
    background: '#F5F8FC',
    fogColor: '#E6EEF8',
    fogNear: 17,
    fogFar: 130,
    theme: 'light',
  },
  Scene: AboutScene,
  /**
   * A touch under the 0.08 default. Four merged meshes and one canvas atlas is a
   * cheap station to warm up, and the two neighbours are the two most expensive
   * on the site — Hero's particle field and Projects' transmission slabs — so the
   * less time this one spends co-mounted with either, the better. 0.06 is still
   * ~77vh of lead.
   */
  mountPadding: 0.06,
  budget: { drawCalls: 14, triangles: 60_000 },
}
