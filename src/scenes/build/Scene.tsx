'use client'

import { useFrame } from '@react-three/fiber'
import type { SceneProps } from '@/engine/types'
import { focusAtDistance, postState } from '@/engine/PostFX'
import { remapClamped } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { BlueprintGrid } from './BlueprintGrid'
import { Conduits } from './Conduit'
import { Glyphs } from './Glyphs'
import { NodeFrames, livePipelineProgress } from './NodeFrame'

/**
 * 06 — HOW I BUILD · "The pipeline"
 *
 * A wireframe schematic of the five-step process, drawn on the grid as you scroll.
 * Five node frames along X from -14 to 14, four conduits carrying the process
 * forward and a fifth looping back underneath, and a blueprint floor.
 *
 * FIVE DRAW CALLS for the whole station: grid, node edges, node fills, all five
 * conduits, all twenty-five glyphs. Nothing here is lit — every surface is an
 * unlit shader, so the station uses none of its three light slots. A blueprint is
 * drawn, not photographed, and shading it would have been a category error as much
 * as a budget one.
 *
 * THE CAMERA, in this station's local space, runs
 *   (-19.5, 6.8, 54.5) → (-14, 2, 24) → (-14, 1.5, 12) → (14, 1.5, 12)
 * so the first two thirds are an approach down the length of the pipeline — where
 * the whole diagram is in frame and visibly assembling — and the last third is the
 * lateral dolly the scene bible asks for, sliding past two or three nodes at a time
 * at a fixed height. The construction schedule in `NodeFrame.tsx` is tuned against
 * that: everything but the feedback loop is built before the dolly starts, and the
 * loop closes as the camera reaches the far end.
 */

export function BuildScene({ progress, quality, reducedMotion }: SceneProps) {
  const low = quality === 'low'
  const orbiting = !low && !reducedMotion

  useFrame(() => {
    // Flat, technical, drawn. Bloom well below the 0.9 default so the brand-blue
    // edges stay as crisp lines instead of glowing into the light background, and a
    // light vignette so the grid's far field does not fight the DOM overlay.
    if (scrollState.activeStation !== 'build') return

    postState.bloomIntensity = 0.34
    postState.bloomThreshold = 0.94
    postState.vignette = 0.2

    // The camera closes from ~40 units out to ~15 across the station, so a fixed
    // focal plane would be wrong at one end or the other. Track the subject.
    const p = livePipelineProgress(progress)
    postState.dofFocusDistance = focusAtDistance(remapClamped(p, 0, 0.66, 40, 16))
    // DOF is all but switched off here, and on purpose. The diagram is drawn in
    // one-pixel lines: the default 2.2 bokeh smeared them into a grey wash and the
    // station stopped reading as a drawing at all. A drawing has no depth of field.
    postState.dofBokehScale = 0.2
  })

  return (
    <group name="build">
      <BlueprintGrid />
      <NodeFrames quality={quality} reducedMotion={reducedMotion} progress={progress} />
      <Conduits quality={quality} reducedMotion={reducedMotion} progress={progress} />
      {orbiting ? <Glyphs quality={quality} progress={progress} /> : null}
    </group>
  )
}
