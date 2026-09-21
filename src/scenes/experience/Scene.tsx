'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Color,
  DoubleSide,
  Group,
  PlaneGeometry,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector3,
} from 'three'
import type { SceneProps } from '@/engine/types'
import { postState, focusAtDistance } from '@/engine/PostFX'
import { clamp, lerp, smoothstep } from '@/lib/math'
import { FRAGMENT_PRELUDE, glsl } from '@/lib/shader'
import { scrollState } from '@/store/useScroll'
import { Helix, climbHeight } from './Helix'
import { Motes } from './Motes'
import { YearMarker } from './YearMarker'
import gridFrag from './shaders/grid.frag'

/**
 * 04 — EXPERIENCE · "Climbing"
 *
 * The one station where the camera gains height: local y 1.1 → 19 while it orbits
 * about 185° around the helix axis. The path does all of that work, so everything
 * here is authored still, around the local origin, rising along +Y.
 *
 * Five draw calls and no lights. The helix core and its additive sheath, one
 * instanced mesh for all three year rings, one `Points` for the motes, one plane
 * for the ground. Every material carries its own hand-rolled key, which leaves all
 * three of the station's spare light slots unused.
 */

// ------------------------------------------------------------------ ground
/**
 * "A ground grid FAR below" is what the bible asks for, and far below is exactly
 * where this camera never looks. It climbs while pitched slightly UP the whole
 * way — the lower edge of the frame is already above y = -2 by local 0.3 — so a
 * plane at -8 would have been a draw call nobody ever saw. At -1.2 it reads as
 * the floor the helix stands on, fills the bottom of the frame for the first
 * quarter of the climb and is gone by the first year marker. Same job, visible.
 */
const GROUND_Y = -1.2
const GROUND_SIZE = 240

const GRID_LINE = new Color('#9DB4D4')
const GRID_MAJOR = new Color('#5B86C4')

const gridVert = glsl`
#include <common>
#include <fog_pars_vertex>

uniform float uSize;

varying vec2 vGrid;

void main() {
  // World-unit coordinates on the plane, so the cells stay one unit across and
  // the fragment stage can work out its own radial falloff. Do NOT compute that
  // falloff here — see the note at the top of shaders/grid.frag.
  vGrid = (uv - 0.5) * uSize;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
`

function Ground({ fade }: { fade: { current: number } }) {
  const built = useMemo(() => {
    const geo = new PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 1, 1)
    geo.rotateX(-Math.PI / 2)

    const mat = new ShaderMaterial({
      vertexShader: gridVert,
      // aaGrid lives in FRAGMENT_PRELUDE because it calls fwidth. Anything from
      // that chunk in a vertex stage fails to link without saying so.
      fragmentShader: `${FRAGMENT_PRELUDE}\n${gridFrag}`,
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uSize: { value: GROUND_SIZE },
        uLine: { value: GRID_LINE },
        uMajor: { value: GRID_MAJOR },
        uOpacity: { value: 0.6 },
        uFalloffNear: { value: 18 },
        uFalloffFar: { value: 100 },
        uFade: { value: 0 },
      },
      fog: true,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    })

    return { geo, mat }
  }, [])

  useEffect(
    () => () => {
      built.geo.dispose()
      built.mat.dispose()
    },
    [built],
  )

  useFrame(() => {
    built.mat.uniforms.uFade.value = fade.current
  })

  return (
    <mesh
      geometry={built.geo}
      material={built.mat}
      position={[0, GROUND_Y, 0]}
      frustumCulled={false}
      name="experience-ground"
    />
  )
}

// ------------------------------------------------------------------- scene
const focusPoint = new Vector3()

export function ExperienceScene({ progress, quality, reducedMotion }: SceneProps) {
  const camera = useThree((s) => s.camera)
  const root = useRef<Group>(null)
  const fade = useRef(0)

  useFrame(() => {
    const p =
      scrollState.activeStation === 'experience' ? scrollState.localProgress : progress

    fade.current = clamp((p - 0.01) / 0.12, 0, 1)

    // ---- depth of field -------------------------------------------------
    // The subject is whichever stretch of helix the camera is level with, so the
    // focal plane is measured to a point on the axis at the current climb height
    // rather than to a fixed distance. Local → world through the station group's
    // matrix; the anchor is never written down here.
    const g = root.current
    if (g) {
      focusPoint.set(0, climbHeight(p), 0).applyMatrix4(g.matrixWorld)
    }

    if (scrollState.activeStation !== 'experience') return

    const distance = g ? clamp(camera.position.distanceTo(focusPoint), 6, 60) : 14

    // BLOOM IS DELIBERATELY RESTRAINED HERE, which is not what the scene bible
    // expects of a tube of light. The page background is `--surface-page`, which
    // reads ~0.97 luminance once ACES and sRGB have run, and the composer's
    // luminance mask is `smoothstep(threshold, threshold + 0.3)`. Any threshold
    // low enough to make the comet bloom also blows the whole sky to white, and
    // any threshold high enough to spare the sky leaves the comet contributing
    // about 1%. There is no setting that separates them. So the filament earns
    // its light through saturation (see `shaders/pulse.frag`) and bloom is left
    // as a gentle lift that grows as the camera closes on the helix.
    postState.bloomIntensity = lerp(0.3, 0.5, smoothstep(0.1, 0.55, p))
    postState.bloomThreshold = 0.94
    postState.vignette = 0.2
    postState.dofFocusDistance = focusAtDistance(distance)
    // Shallow: the helix is a thin filament and heavy bokeh turns it to mush.
    // At the engine default of 2.2 the high tier looked WORSE than the low one.
    postState.dofBokehScale = 0.7
    postState.chromaticAberration = 0
  })

  return (
    <group ref={root} name="experience">
      <Helix quality={quality} reducedMotion={reducedMotion} progress={progress} />
      <YearMarker quality={quality} reducedMotion={reducedMotion} progress={progress} />
      <Motes quality={quality} reducedMotion={reducedMotion} progress={progress} />
      <Ground fade={fade} />
    </group>
  )
}
