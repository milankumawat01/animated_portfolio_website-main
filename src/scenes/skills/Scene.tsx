'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import type { SceneProps } from '@/engine/types'
import { lerp, smoothstep } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { Graph } from './Graph'

/**
 * 05 — SKILLS · "The stack, as a structure"
 *
 * The camera is nearly static here: a slow push-in from ~17 units out to ~12.5,
 * a deliberate rest beat after four stations of travel. The graph is the only thing
 * that moves, and it is the one object on the site the visitor can grab.
 *
 * The station adds no lights of its own — the node and edge shaders carry their own
 * hand-rolled key and rim, which is what keeps the whole thing inside three draw
 * calls and leaves all three of the station's light slots unused.
 */

/**
 * On a wide viewport the DOM overlay occupies the left column, so the graph is
 * pushed into the open right-hand third rather than sitting under the cards. On a
 * narrow one the DOM stacks full-width, so the graph stays centred and shrinks.
 *
 * The offset and scale ease with local progress. They have to: the camera closes
 * from ~17 units to ~12.5, which magnifies everything by about a third, and a fixed
 * world offset would walk the graph off the right edge on the way in. Easing them
 * keeps the graph parked in its column and leaves a ~17% push-in you can still feel.
 */
const WIDE_OFFSET_X = [7.0, 3.4] as const
const WIDE_OFFSET_Y = [-0.35, 0.0] as const
const WIDE_SCALE = [1, 0.78] as const
const NARROW_SCALE = 0.72

export function SkillsScene({ progress, quality, reducedMotion }: SceneProps) {
  const wide = useThree((s) => s.size.width / Math.max(s.size.height, 1) > 1.15)
  const place = useRef<Group>(null)

  useFrame(() => {
    const g = place.current
    if (!g) return

    // The prop is quantized; the hot path is not, and this is a slide across the
    // whole station rather than a branch.
    const lp =
      scrollState.activeStation === 'skills' ? scrollState.localProgress : progress
    // Held near the start value through the first quarter — that is where the DOM
    // column is pinned — then eased back toward centre as the overlay scrolls away
    // and the camera closes in.
    const t = smoothstep(0.25, 1, lp)

    if (wide) {
      g.position.set(
        lerp(WIDE_OFFSET_X[0], WIDE_OFFSET_X[1], t),
        lerp(WIDE_OFFSET_Y[0], WIDE_OFFSET_Y[1], t),
        0,
      )
      g.scale.setScalar(lerp(WIDE_SCALE[0], WIDE_SCALE[1], t))
    } else {
      g.position.set(0, 0.6, 0)
      g.scale.setScalar(NARROW_SCALE)
    }
  })

  return (
    <group name="skills">
      <group ref={place}>
        <Graph quality={quality} reducedMotion={reducedMotion} progress={progress} />
      </group>
    </group>
  )
}
