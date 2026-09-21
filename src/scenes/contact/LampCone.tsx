'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, CylinderGeometry, DoubleSide, ShaderMaterial } from 'three'
import { FRAGMENT_PRELUDE, glsl } from '@/lib/shader'
import { damp } from '@/lib/math'
import fragmentShader from './shaders/cone.frag'

/**
 * A volumetric shaft of warm light. One open cylinder, forty-eight triangles, and
 * it carries the entire mood of the closing station — build the rest of the scene
 * around where this lands.
 *
 * The group origin is the TIP (the lamp), and the cone hangs down from it, so a
 * caller positions the light source and never has to think about the geometry's
 * midpoint. Put `<LampCone>` at the bulb; it reaches `height` units below.
 *
 *   <LampCone height={10} topRadius={0.3} bottomRadius={3.6} position={[3.3, 8.2, -6.6]} />
 *
 * The vertex stage owns the fades because they are per-vertex smooth and free
 * there, and because the prelude split means the fragment file is the only one
 * allowed to touch derivatives. See `shaders/cone.frag` for the rest.
 */

/**
 * Derivative-free, so it links in a vertex stage. Do NOT add the fragment prelude.
 *
 * WHY THE FADES ARE NOT COMPUTED HERE, even though the scene bible describes the
 * cone as "vertex-faded toward the tip".
 *
 * They were, first as `smoothstep(1.0, 1.0 - uTipFade, uv.y)` — which is undefined
 * behaviour, GLSL ES requires edge0 < edge1 — and then correctly as
 * `1.0 - smoothstep(0.78, 1.0, uv.y)`, and finally as an explicit clamp/hermite
 * with no smoothstep in it at all. All three came back as a constant 0 under
 * ANGLE/SwiftShader, so the cone drew nothing whatsoever. Bisected with the
 * station probe: `vFade = uv.y` interpolates into the fragment stage perfectly,
 * any ARITHMETIC on `uv.y` written into that same varying does not survive.
 *
 * On the tiers that have bloom, the desk's warm point light faked enough of a glow
 * that a completely missing cone still read as a dim shaft; only `?q=low`, with no
 * desk and no post stack, made it obvious. Worth remembering as a class of bug:
 * a subtle-by-design additive effect can be entirely absent and still look
 * plausible next to something else warm.
 *
 * So this stage only passes through, and `shaders/cone.frag` shapes the fades off
 * `vUv.y`. Per-fragment is if anything the better curve; it is a handful of ALU on
 * forty-eight triangles.
 */
const vertexShader = glsl`
varying vec2 vUv;
varying vec3 vNrm;
varying vec3 vView;

void main() {
  vUv = uv;

  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = -mv.xyz;
  vNrm  = normalMatrix * normal;

  gl_Position = projectionMatrix * mv;
}
`

export interface LampConeProps {
  /** how far the shaft reaches below the group origin */
  height: number
  /** radius at the tip, inside the lamp */
  topRadius: number
  /** radius where it lands */
  bottomRadius: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  /** body colour of the shaft — the lamp warm from the design tokens */
  color?: string
  /** the paler, hotter colour just under the bulb */
  coreColor?: string
  /** peak alpha; damped, so it is safe to animate */
  opacity?: number
  /** drifting motes. false under reduced motion. */
  idle?: boolean
  /** 0 disables the noise lookup entirely */
  dust?: number
  /** 24 is plenty; the silhouette is a gradient, not a polygon count */
  segments?: number
}

/** --lamp-warm, docs/01-DESIGN-SYSTEM.md §1. */
const LAMP_WARM = '#F5A524'
const LAMP_CORE = '#FFE2AE'

export function LampCone({
  height,
  topRadius,
  bottomRadius,
  position,
  rotation,
  color = LAMP_WARM,
  coreColor = LAMP_CORE,
  opacity = 0.42,
  idle = true,
  dust = 0.55,
  segments = 24,
}: LampConeProps) {
  const geometry = useMemo(() => {
    const g = new CylinderGeometry(topRadius, bottomRadius, height, segments, 1, true)
    // Hang from the origin: the tip, not the midpoint, is the anchor.
    g.translate(0, -height / 2, 0)
    return g
  }, [topRadius, bottomRadius, height, segments])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        // FRAGMENT_PRELUDE, not VERTEX_PRELUDE: cone.frag calls snoise, and the
        // fragment set is the one the project guarantees for a fragment stage.
        fragmentShader: `${FRAGMENT_PRELUDE}\n${fragmentShader}`,
        uniforms: {
          uColor: { value: new Color(color) },
          uCore: { value: new Color(coreColor) },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uDust: { value: dust },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: DoubleSide,
        blending: AdditiveBlending,
        // Additive light does not get fogged toward the background — it IS the
        // background's brightest thing. Fog here would grey the shaft out.
        fog: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  useEffect(() => {
    ;(material.uniforms.uColor.value as Color).set(color)
    ;(material.uniforms.uCore.value as Color).set(coreColor)
  }, [material, color, coreColor])

  const target = useRef(opacity)
  target.current = opacity

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const u = material.uniforms
    if (idle) u.uTime.value += dt
    u.uDust.value = idle ? dust : 0
    // Damped, because the station drives this off the quantized `progress` prop.
    u.uOpacity.value = damp(u.uOpacity.value as number, target.current, 4, dt)
  })

  return (
    <mesh
      name="contact-lamp-cone"
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      renderOrder={2}
      frustumCulled={false}
    />
  )
}
