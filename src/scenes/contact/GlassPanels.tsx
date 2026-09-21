'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { glsl } from '@/lib/shader'
import { damp, hash11 } from '@/lib/math'
import { hoveredIdIn } from '@/store/useInteraction'
import { CONTACT_TILE_IDS } from './tiles'

/**
 * THE 3D ECHO OF THE FOUR CONTACT TILES.
 *
 * Four small panels floating in the plane the DOM tiles occupy, each one brightening
 * when its tile is hovered. The scene bible calls them glass; they are one
 * `InstancedMesh` with one shared material instead, for two reasons:
 *
 *   - Four `MeshTransmissionMaterial`s would be four full-scene FBO renders every
 *     frame. Projects already learned that the hard way and ships exactly one.
 *     Even one here would cost more than this whole station.
 *   - Four meshes sharing a material is still four draw calls — three.js batches
 *     by mesh, not by material. Instancing is the only thing that actually shares.
 *
 * So the glass is a shader: a rounded-rect pane with a fresnel-lit edge, a faint
 * inner stroke and a cool tint, over a near-black background. At `low` the fresnel
 * and the idle float are switched off and they become the flat planes the tier
 * table asks for — same mesh, same one draw call.
 *
 * Hover comes from `useInteraction`, read imperatively inside `useFrame`. Never
 * subscribe: this component must not re-render on a pointer move.
 */

const vertexShader = glsl`
attribute float aHeat;
attribute float aSeed;

uniform float uTime;
uniform float uIdle;

varying vec2  vUv;
varying float vHeat;
varying vec3  vNrm;
varying vec3  vView;

void main() {
  vUv = uv;
  vHeat = aHeat;

  vec3 p = position;
  float t = uTime + aSeed * 6.2831853;
  p.y += uIdle * sin(t * 0.52) * 0.06;
  p.x += uIdle * cos(t * 0.37) * 0.035;
  // A hovered pane leans a touch toward the viewer.
  p *= 1.0 + aHeat * 0.05;

  vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  vView = -mv.xyz;
  vNrm  = normalMatrix * mat3(instanceMatrix) * normal;

  gl_Position = projectionMatrix * mv;
}
`

/**
 * No prelude at all: nothing here needs noise, and nothing here needs a derivative.
 * The rounded-rect SDF is exact, so the edges anti-alias from the smoothstep width.
 */
const fragmentShader = glsl`
uniform vec3  uTint;
uniform vec3  uEdge;
uniform float uOpacity;
uniform float uGlass;

varying vec2  vUv;
varying float vHeat;
varying vec3  vNrm;
varying vec3  vView;

float roundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 p = vUv - 0.5;
  float sd = roundRect(p, vec2(0.5, 0.5), 0.085);

  float fill = 1.0 - smoothstep(-0.010, 0.0, sd);
  float stroke = exp(-abs(sd + 0.014) * 170.0);

  // Glass edges brighten where the surface turns away. Off at the low tier.
  float facing = abs(dot(normalize(vNrm), normalize(vView)));
  float fres = uGlass * pow(1.0 - facing, 3.0);

  // A soft diagonal sheen across the pane; the thing that stops a flat rectangle
  // reading as a flat rectangle.
  float sheen = uGlass * smoothstep(0.62, 1.0, (vUv.x * 0.55 + vUv.y * 0.45)) * 0.55;

  float heat = clamp(vHeat, 0.0, 1.0);

  float body = (0.16 + fres * 0.55 + sheen) * fill;
  float edge = stroke * (0.45 + fres * 0.5);

  float a = (body + edge) * (0.55 + heat * 1.35) * uOpacity;
  if (a <= 0.003) discard;

  vec3 col = mix(uTint, uEdge, clamp(edge * 1.6 + fres, 0.0, 1.0));
  col = mix(col, vec3(1.0), heat * 0.35);

  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export interface GlassPanelsProps {
  /** centre of the 2 × 2 block, in station-local space */
  center: [number, number, number]
  /** panel size */
  size?: [number, number]
  /** column / row pitch */
  pitch?: [number, number]
  quality: QualityTier
  /** false under reduced motion: panels hold still, hover still works */
  idle?: boolean
  opacity?: number
}

const COLUMNS = 2
/** brand-400 at a fraction of its saturation — these must never fight the copy. */
const TINT = '#6E9BE8'
const EDGE = '#CFE0FA'

const dummy = new Object3D()

export function GlassPanels({
  center,
  size = [3.3, 0.58],
  pitch = [3.265, 0.612],
  quality,
  idle = true,
  opacity = 0.62,
}: GlassPanelsProps) {
  const mesh = useRef<InstancedMesh>(null)
  const count = CONTACT_TILE_IDS.length
  const low = quality === 'low'

  /**
   * Destructured to scalars on purpose. The tuple props are array literals at the
   * call site, so a fresh identity arrives every render — keying the geometry memo
   * on the array would rebuild the panes sixty times a second.
   */
  const [panelW, panelH] = size
  const [pitchX, pitchY] = pitch
  const [cx, cy, cz] = center

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(panelW, panelH)
    const heat = new Float32Array(count)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) seed[i] = hash11(i * 3.77 + 13.1)
    g.setAttribute('aHeat', new InstancedBufferAttribute(heat, 1))
    g.setAttribute('aSeed', new InstancedBufferAttribute(seed, 1))
    return g
  }, [panelW, panelH, count])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTint: { value: new Color(TINT) },
          uEdge: { value: new Color(EDGE) },
          uOpacity: { value: 0 },
          uGlass: { value: 1 },
          uTime: { value: 0 },
          uIdle: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        fog: false,
      }),
    [],
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  /** Static placement: a 2 × 2 block in the order `copy.contact.tiles` renders. */
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    for (let i = 0; i < count; i++) {
      const col = i % COLUMNS
      const row = Math.floor(i / COLUMNS)
      dummy.position.set(
        cx + (col - (COLUMNS - 1) / 2) * pitchX,
        cy + ((count / COLUMNS - 1) / 2 - row) * pitchY,
        cz + (hash11(i * 9.4 + 2.2) - 0.5) * 0.22,
      )
      dummy.rotation.set(0, (hash11(i * 5.1 + 7.7) - 0.5) * 0.07, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [cx, cy, cz, pitchX, pitchY, count])

  const targetOpacity = useRef(opacity)
  targetOpacity.current = opacity

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const u = material.uniforms

    if (idle) u.uTime.value += dt
    u.uIdle.value = damp(u.uIdle.value as number, idle ? 1 : 0, 4, dt)
    u.uGlass.value = low ? 0 : 1
    u.uOpacity.value = damp(u.uOpacity.value as number, targetOpacity.current, 3.5, dt)

    const m = mesh.current
    if (!m) return
    const attr = m.geometry.getAttribute('aHeat') as InstancedBufferAttribute
    const arr = attr.array as Float32Array
    const hovered = hoveredIdIn('contact')

    let changed = false
    for (let i = 0; i < count; i++) {
      // 180ms is the design system's hover duration, so lambda ≈ 12.
      const next = damp(arr[i], CONTACT_TILE_IDS[i] === hovered ? 1 : 0, 12, dt)
      if (Math.abs(next - arr[i]) > 0.0005) {
        arr[i] = next
        changed = true
      }
    }
    if (changed) attr.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      name="contact-glass-panels"
      args={[geometry, material, count]}
      renderOrder={1}
      frustumCulled={false}
    />
  )
}
