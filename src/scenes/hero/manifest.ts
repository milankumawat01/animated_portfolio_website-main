import type { SceneManifest } from '@/engine/types'
import { stationCamera } from '@/lib/curves'
import { HeroScene } from './Scene'

/**
 * 01 — HERO. Camera comes from `stationCamera`, never from hand-written keyframes:
 * that is what guarantees this station's `to` is literally About's `from`.
 *
 * `mountPadding` is well under the 0.08 default on purpose. Hero carries 150k
 * particles at the `high` tier, and the default padding — 0.08 of *page* progress
 * against a station only 0.11 wide — would keep the whole cloud alive most of the
 * way through About. By 0.04 past the boundary the mark is fully dispersed and
 * faded, so nothing pops when it goes.
 */
export const heroManifest: SceneManifest = {
  id: 'hero',
  order: 1,
  range: [0.0, 0.11],
  camera: stationCamera('hero'),
  environment: {
    // --night-900, docs/01-DESIGN-SYSTEM.md §1.
    background: '#05080E',
    fogColor: '#05080E',
    fogNear: 6,
    fogFar: 40,
    theme: 'dark',
  },
  Scene: HeroScene,
  mountPadding: 0.04,
  budget: { drawCalls: 24, triangles: 180_000 },
}
