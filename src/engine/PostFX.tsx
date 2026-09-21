'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing'
import type { BloomEffect, ChromaticAberrationEffect, DepthOfFieldEffect } from 'postprocessing'
import { damp } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'

/**
 * The global post stack. One composer for the whole page — stations never create
 * their own.
 *
 * Stations dial the effects by mutating `postState` inside their own `useFrame`.
 * It is a plain object rather than a store on purpose: rebuilding an effect from
 * React state recompiles a shader, and doing that mid-scroll is a visible hitch.
 * Write the value you want and it is damped toward over a few frames.
 *
 *   useFrame(() => { postState.bloomIntensity = 1.4 })
 *
 * Always write every frame you want a non-default value; the defaults are restored
 * by whatever writes last, so a station that stops writing simply stops affecting it.
 */
export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 260

/**
 * Convert a distance in world units to the normalised depth `DepthOfField` wants.
 *
 * Always use this rather than guessing. The old hardcoded default of 0.02 focused at
 * roughly 5 world units, and every station frames its subject 8–20 units out — so at
 * the `high` tier the whole site rendered as mush and it looked like a shader bug.
 *
 *   useFrame(() => { postState.dofFocusDistance = focusAtDistance(14) })
 */
export const focusAtDistance = (worldUnits: number): number =>
  (worldUnits - CAMERA_NEAR) / (CAMERA_FAR - CAMERA_NEAR)

export const postState = {
  bloomIntensity: 0.9,
  bloomThreshold: 0.75,
  /** extra chromatic aberration on top of the velocity-driven amount */
  chromaticAberration: 0,
  /** ~13 world units — a sane mid-station subject distance. */
  dofFocusDistance: focusAtDistance(13),
  dofBokehScale: 2.2,
  vignette: 0.42,
}

const DEFAULTS = { ...postState }

/** Restore the defaults. `SceneDirector` does not call this; stations opt in. */
export const resetPostState = (): void => {
  Object.assign(postState, DEFAULTS)
}

/** Velocity smears the light. The single best scroll-feedback trick on the page. */
const CA_FROM_VELOCITY = 0.0016

export function PostFX() {
  const tier = useQuality((s) => s.tier)
  const reducedMotion = useQuality((s) => s.reducedMotion)

  const bloom = useRef<BloomEffect>(null)
  const ca = useRef<ChromaticAberrationEffect>(null)
  const dof = useRef<DepthOfFieldEffect>(null)
  const smoothed = useRef({ bloom: 0.9, ca: 0, focus: postState.dofFocusDistance })

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const s = smoothed.current

    s.bloom = damp(s.bloom, postState.bloomIntensity, 6, dt)
    if (bloom.current) {
      bloom.current.intensity = s.bloom
      bloom.current.luminanceMaterial.threshold = postState.bloomThreshold
    }

    if (ca.current) {
      const target =
        postState.chromaticAberration +
        (reducedMotion ? 0 : Math.abs(scrollState.velocity) * CA_FROM_VELOCITY)
      s.ca = damp(s.ca, target, 8, dt)
      ca.current.offset.set(s.ca, s.ca * 0.6)
    }

    if (dof.current) {
      if (!Number.isFinite(s.focus)) s.focus = postState.dofFocusDistance
      s.focus = damp(s.focus, postState.dofFocusDistance, 4, dt)
      const com = dof.current.circleOfConfusionMaterial
      if (com && 'focusDistance' in com) {
        ;(com as unknown as { focusDistance: number }).focusDistance = s.focus
      }
      dof.current.bokehScale = postState.dofBokehScale
    }
  })

  // No composer at all on low — an empty pass still costs a full-screen blit.
  if (tier === 'low') return null

  if (tier === 'medium') {
    return (
      <EffectComposer key="fx-medium" multisampling={0} enableNormalPass={false}>
        <Bloom
          ref={bloom}
          intensity={0.9}
          luminanceThreshold={0.75}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.28} darkness={postState.vignette} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer key="fx-high" multisampling={4} enableNormalPass={false}>
      <Bloom
        ref={bloom}
        intensity={0.9}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <DepthOfField
        ref={dof}
        focusDistance={postState.dofFocusDistance}
        focalLength={0.05}
        bokehScale={2.2}
        height={480}
      />
      <ChromaticAberration ref={ca} offset={[0, 0]} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.28} darkness={postState.vignette} />
    </EffectComposer>
  )
}
