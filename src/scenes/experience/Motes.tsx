'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { clamp } from '@/lib/math'
import { glsl } from '@/lib/shader'
import { scrollState } from '@/store/useScroll'

/**
 * Ambient motes, drifting downward around the helix.
 *
 * The cheapest "you are ascending" cue there is, and the one that does the most
 * work: without it a vertical camera move on a symmetrical helix is ambiguous.
 *
 * One `Points`, one draw call, zero triangles, and nothing is written from the CPU
 * per frame — every mote's position is a pure function of its seed and `uTime` in
 * the vertex shader, so 2,000 of them cost one uniform write.
 *
 * Their fall also picks up scroll direction: scrolling back down the page slows and
 * reverses the drift, which keeps the cue honest instead of insisting you are
 * climbing while you are not.
 */

const COUNT: Record<QualityTier, number> = { low: 200, medium: 1000, high: 2000 }

/** Vertical extent of the column of motes, a little taller than the helix. */
const SPAN = 26
const FLOOR = -4
const RADIUS_INNER = 1.6
const RADIUS_OUTER = 11

const MOTE_COLOR = new Color(0.16, 0.34, 0.78)

const motesVert = glsl`
#include <common>
#include <fog_pars_vertex>

attribute vec3 aSeed;

uniform float uTime;
uniform float uSpan;
uniform float uFloor;
uniform float uSize;
uniform float uFade;
uniform float uPixelRatio;

varying float vAlpha;

void main() {
  // Seeds: x = angle, y = fall phase, z = radius / size.
  float phase = fract(aSeed.y + uTime * 0.028);
  float y = uFloor + phase * uSpan;

  float radius = mix(${RADIUS_INNER.toFixed(2)}, ${RADIUS_OUTER.toFixed(2)}, aSeed.z);
  float angle = aSeed.x * 6.2831853 + uTime * 0.02;

  vec3 p = vec3(cos(angle) * radius, y, sin(angle) * radius);
  // Lateral wander, so they do not fall in perfect vertical lines.
  p.x += sin(uTime * 0.31 + aSeed.y * 21.7) * 0.42;
  p.z += cos(uTime * 0.27 + aSeed.x * 17.3) * 0.42;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  float dist = max(-mvPosition.z, 0.1);

  gl_PointSize = uSize * uPixelRatio * (0.45 + aSeed.z * 0.9) * (18.0 / dist);
  gl_Position = projectionMatrix * mvPosition;

  // Fade in at the top of the column and out at the bottom so nothing pops.
  vAlpha =
    uFade *
    smoothstep(0.0, 0.10, 1.0 - phase) *
    smoothstep(0.0, 0.14, phase) *
    (0.35 + 0.65 * aSeed.z);

  #include <fog_vertex>
}
`

const motesFrag = glsl`
#include <common>
#include <fog_pars_fragment>

uniform vec3 uColor;

varying float vAlpha;

void main() {
  // Soft round sprite, written out rather than pulled from COMMON: that chunk
  // arrives bundled with simplex noise and this shader wants nine instructions.
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = (1.0 - smoothstep(0.12, 1.0, d)) * vAlpha;
  if (a < 0.004) discard;

  gl_FragColor = vec4(uColor, a);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

export interface MotesProps {
  quality: QualityTier
  reducedMotion: boolean
  progress: number
}

export function Motes({ quality, reducedMotion, progress }: MotesProps) {
  const built = useMemo(() => {
    const count = COUNT[quality]
    const seeds = new Float32Array(count * 3)

    // Deterministic, so the layout is identical between renders and tiers below it
    // are a subset rather than a different cloud.
    let n = 1
    const rand = () => {
      n = (n * 1664525 + 1013904223) % 4294967296
      return n / 4294967296
    }

    for (let i = 0; i < count; i++) {
      seeds[i * 3] = rand()
      seeds[i * 3 + 1] = rand()
      // Biased outward: a uniform radius seed crowds everything against the helix.
      seeds[i * 3 + 2] = Math.sqrt(rand())
    }

    const geo = new BufferGeometry()
    // `position` is unused — every mote's place comes out of aSeed in the vertex
    // shader — but three needs the attribute to work out the draw count. The mesh
    // is `frustumCulled={false}` for the same reason: its real bounds live on the
    // GPU and a bounding sphere computed from zeroed positions would cull it.
    geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(count * 3), 3))
    geo.setAttribute('aSeed', new Float32BufferAttribute(seeds, 3))

    const mat = new ShaderMaterial({
      vertexShader: motesVert,
      fragmentShader: motesFrag,
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uTime: { value: 0 },
        uSpan: { value: SPAN },
        uFloor: { value: FLOOR },
        uSize: { value: quality === 'low' ? 2.6 : 2.0 },
        uFade: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: MOTE_COLOR },
      },
      fog: true,
      transparent: true,
      depthWrite: false,
    })

    return { geo, mat }
  }, [quality])

  useEffect(
    () => () => {
      built.geo.dispose()
      built.mat.dispose()
    },
    [built],
  )

  const points = useRef<Points>(null)
  const state = useRef({ time: 0 })

  useFrame(({ gl }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const s = state.current

    const p =
      scrollState.activeStation === 'experience' ? scrollState.localProgress : progress

    // Reduced motion freezes the cloud; it keeps its shape and its depth cue and
    // loses only the drift.
    if (!reducedMotion) {
      // Scrolling up the page pushes the motes past you faster; scrolling back
      // down slows them and can reverse them. `velocity` is signed and damped.
      const drive = 1 + clamp(scrollState.velocity, -1, 1) * 1.8
      s.time += dt * drive
    }

    built.mat.uniforms.uTime.value = s.time
    built.mat.uniforms.uFade.value = clamp((p - 0.01) / 0.12, 0, 1)
    built.mat.uniforms.uPixelRatio.value = gl.getPixelRatio()
  })

  return (
    <points
      ref={points}
      geometry={built.geo}
      material={built.mat}
      frustumCulled={false}
      name="experience-motes"
    />
  )
}
