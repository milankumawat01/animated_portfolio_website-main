'use client'

import { useEffect, useMemo } from 'react'
import { Color, PlaneGeometry, ShaderMaterial, UniformsLib, UniformsUtils } from 'three'
import { FRAGMENT_PRELUDE, glsl } from '@/lib/shader'
import { GRID_Y } from './NodeFrame'
import gridFrag from './shaders/grid.frag'

/**
 * 06 — HOW I BUILD · the blueprint floor.
 *
 * One plane. Two triangles. One draw call. No texture, no mipmaps, no memory — the
 * grid is `abs(fract(uv * N) - 0.5)` thresholded in `grid.frag`, so it stays crisp
 * at any camera distance and costs the same whether it is 20 units across or 200.
 *
 * The plane is authored large and faded out radially rather than sized to the
 * camera: a fade has no edge to catch, and the camera crosses 45 units of Z through
 * this station so anything sized to one framing would be wrong at the other.
 *
 * The vertex stage is inline here rather than a file because it does one thing —
 * hand the fragment shader plane-local coordinates in world units, which is what
 * makes the grid spacing a physical quantity (1 unit minor, 5 unit major) instead
 * of a function of how big the plane happens to be.
 */

/**
 * Sized to this station, not to the world. At 200x190 with a fade reaching 92
 * units, the floor was still ~60% opaque at the Writing anchor 37 units away and
 * dominated that station's lower half — which directly fights its 'light, airy,
 * weightless' brief. The pipeline is 28 units wide; 96 is generous for it.
 */
const PLANE_W = 96
const PLANE_D = 88
/** pushed back so the grid reads behind the pipeline as well as under it */
const PLANE_Z = -8

const GRID_VERT = glsl`
#include <common>
#include <fog_pars_vertex>

uniform vec2 uSize;

varying vec2 vGrid;

void main() {
  vGrid = (uv - 0.5) * uSize;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const MINOR = new Color('#9FB6D4')
const MAJOR = new Color('#5B81B8')

export function BlueprintGrid() {
  const built = useMemo(() => {
    const geometry = new PlaneGeometry(PLANE_W, PLANE_D, 1, 1)
    const material = new ShaderMaterial({
      vertexShader: GRID_VERT,
      fragmentShader: `${FRAGMENT_PRELUDE}\n${gridFrag}`,
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uSize: { value: [PLANE_W, PLANE_D] },
        uMinorColor: { value: MINOR },
        uMajorColor: { value: MAJOR },
        // 1 world unit between minor lines, 5 between major ones.
        uMinorFreq: { value: 1.0 },
        uMajorFreq: { value: 0.2 },
        uMinorAlpha: { value: 0.26 },
        uMajorAlpha: { value: 0.55 },
        uFadeNear: { value: 18 },
        uFadeFar: { value: 40 },
        uFade: { value: 1 },
      },
      fog: true,
      transparent: true,
      depthWrite: false,
    })
    return { geometry, material }
  }, [])

  useEffect(
    () => () => {
      built.geometry.dispose()
      built.material.dispose()
    },
    [built],
  )

  return (
    <mesh
      name="build-grid"
      args={[built.geometry, built.material]}
      position={[0, GRID_Y, PLANE_Z]}
      rotation={[-Math.PI / 2, 0, 0]}
      frustumCulled={false}
    />
  )
}
