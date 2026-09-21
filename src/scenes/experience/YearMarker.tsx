'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  TorusGeometry,
  UniformsLib,
  UniformsUtils,
  Vector3,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { clamp, damp, smoothstep } from '@/lib/math'
import { glsl } from '@/lib/shader'
import { scrollState } from '@/store/useScroll'
import { MARKER_HEIGHTS, climbHeight, helixRadiusAt } from './Helix'

/**
 * Three year markers: a ring of light around the helix at each role's height.
 *
 * ONE draw call for all three. They differ in radius, spin phase and arrival pulse,
 * and all three of those ride in the instance matrix or a one-float instance
 * attribute, so nothing here needs a second material.
 *
 * NO `Text3D`. A6 (`satoshi-bold.typeface.json`) does not exist and there is no
 * woff2 in `public/fonts` to generate one from, and the phase doc is explicit that
 * DOM labels are an acceptable FINAL state rather than a stub — shipping drei's
 * default helvetiker next to Satoshi headlines would be worse than shipping no 3D
 * text at all. So the ring carries the meaning and the DOM card carries the year.
 * To make a ring readable as an object rather than an undifferentiated circle it
 * is lit in three arcs; that is also what makes the slow spin visible, since a
 * uniform torus rotating about its own axis is a static image.
 */

const RING_CLEARANCE = 0.8
const TUBE = 0.014

const TUBULAR: Record<QualityTier, number> = { low: 56, medium: 96, high: 128 }
const RADIAL: Record<QualityTier, number> = { low: 4, medium: 6, high: 6 }

/** Radians per second, one per ring so they never line up. */
const SPIN = [0.13, -0.1, 0.16]
const PHASE = [0, 2.1, 4.3]

/** World units of camera height either side of a ring that count as "arrived". */
const ARRIVAL_WINDOW = 2.4

/**
 * Same reasoning as the tube: on `--surface-page` a ring gets read by how
 * SATURATED it is, not how bright. Additive blending and an over-1 colour made
 * all three rings disappear into the page — the first probe caught them as three
 * faint white ellipses. Alpha-blended azure, brightening to cyan on arrival.
 */
const RING_COLOR = new Color(0.04, 0.24, 1.2)
const RING_HOT = new Color(0.3, 0.95, 1.6)

const ringVert = glsl`
#include <common>
#include <fog_pars_vertex>

attribute float aPulse;

varying vec2 vRingUv;
varying vec3 vNormalV;
varying float vPulse;

void main() {
  vRingUv = uv;
  vPulse = aPulse;
  vNormalV = normalize(normalMatrix * mat3(instanceMatrix) * normal);

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
`

const ringFrag = glsl`
#include <common>
#include <fog_pars_fragment>

uniform vec3 uColor;
uniform vec3 uHot;
uniform float uFade;

varying vec2 vRingUv;
varying vec3 vNormalV;
varying float vPulse;

void main() {
  // Three arcs around the major circumference. uv.x runs 0..1 the long way round.
  float arcs = pow(0.5 + 0.5 * cos(vRingUv.x * 6.2831853 * 3.0), 2.4);

  float facing = abs(normalize(vNormalV).z);
  float key = mix(0.5, 1.0, facing);

  vec3 col = mix(uColor, uHot, vPulse * (0.35 + arcs * 0.45)) * key;

  float alpha = (0.16 + arcs * 0.62 + vPulse * 0.22) * uFade;
  gl_FragColor = vec4(col, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

// Hoisted so the per-frame loop allocates nothing.
const tmpMatrix = new Matrix4()
const tmpQuat = new Quaternion()
const tmpSpin = new Quaternion()
const tmpPos = new Vector3()
const tmpScale = new Vector3()
const AXIS_X = new Vector3(1, 0, 0)
const AXIS_Y = new Vector3(0, 1, 0)

export interface YearMarkerProps {
  quality: QualityTier
  reducedMotion: boolean
  progress: number
}

export function YearMarker({ quality, reducedMotion, progress }: YearMarkerProps) {
  const count = MARKER_HEIGHTS.length

  const built = useMemo(() => {
    // Unit torus, scaled per instance. One geometry, three radii.
    const geo = new TorusGeometry(1, TUBE, RADIAL[quality], TUBULAR[quality])

    const pulse = new Float32Array(count)
    const attr = new InstancedBufferAttribute(pulse, 1)
    attr.setUsage(DynamicDrawUsage)
    geo.setAttribute('aPulse', attr)

    const mat = new ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uColor: { value: RING_COLOR },
        uHot: { value: RING_HOT },
        uFade: { value: 0 },
      },
      fog: true,
      transparent: true,
      depthWrite: false,
    })

    return { geo, mat, pulse, attr }
  }, [quality, count])

  useEffect(
    () => () => {
      built.geo.dispose()
      built.mat.dispose()
    },
    [built],
  )

  const mesh = useRef<InstancedMesh>(null)
  const state = useRef({ time: 0 })

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const s = state.current
    const m = mesh.current
    if (!m) return

    const p =
      scrollState.activeStation === 'experience' ? scrollState.localProgress : progress
    const y = climbHeight(p)

    if (!reducedMotion) s.time += dt
    built.mat.uniforms.uFade.value = clamp((p - 0.015) / 0.1, 0, 1)

    for (let i = 0; i < count; i++) {
      const h = MARKER_HEIGHTS[i]
      // Arrival: 1 when the camera is level with the ring, 0 once it is a couple
      // of units past. Damped so a fast scroll still gets a visible swell.
      const target = 1 - smoothstep(0, ARRIVAL_WINDOW, Math.abs(y - h))
      built.pulse[i] = damp(built.pulse[i], target, 7, dt)

      const radius = helixRadiusAt(h) + RING_CLEARANCE
      const spin = PHASE[i] + s.time * SPIN[i]

      // Lay the torus flat (it is built in XY) and spin it about the helix axis.
      tmpQuat.setFromAxisAngle(AXIS_X, -Math.PI / 2)
      tmpQuat.premultiply(tmpSpin.setFromAxisAngle(AXIS_Y, spin))
      tmpPos.set(0, h, 0)
      tmpScale.setScalar(radius * (1 + built.pulse[i] * 0.045))
      tmpMatrix.compose(tmpPos, tmpQuat, tmpScale)
      m.setMatrixAt(i, tmpMatrix)
    }

    m.instanceMatrix.needsUpdate = true
    built.attr.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[built.geo, built.mat, count]}
      frustumCulled={false}
      name="experience-markers"
    />
  )
}
