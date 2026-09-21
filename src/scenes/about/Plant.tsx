'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  type IUniform,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { VERTEX_PRELUDE } from '@/lib/shader'
import { hash11 } from '@/lib/math'

/**
 * The desk plant: 40 leaf quads on a single `InstancedMesh`, one draw call.
 *
 * The leaf *shape* is cut out of the quad in the fragment stage with a `discard`
 * against a sine-tapered width, so the geometry stays a 4-segment plane and the
 * silhouette still reads as a leaf. The 4 segments exist for the sway, which bends
 * the blade along its length rather than rotating it rigidly — a rigid rotation
 * looks like a windscreen wiper at this scale.
 *
 * The sway lives in a chunk injected into `MeshStandardMaterial` rather than in a
 * hand-rolled `ShaderMaterial`, so the leaves pick up the global three lights, the
 * station fog and tone mapping for free and match the desk exactly.
 *
 * `VERTEX_PRELUDE` — not `FRAGMENT_PRELUDE`. The latter's `aaLine`/`aaGrid` call
 * `fwidth` and fail to link in a vertex stage, silently.
 */

const LEAF_W = 0.26
const LEAF_H = 0.95

const COUNT: Record<QualityTier, number> = { low: 22, medium: 40, high: 40 }

/** Leaf greens, kept desaturated to sit inside the pastel isometric register. */
const GREEN_A = new Color('#4E9A63')
const GREEN_B = new Color('#8FC49A')

const SWAY_VERTEX = `
uniform float uTime;
uniform float uSway;
uniform float uGrow;
attribute float aSeed;
`

const SWAY_BODY = `
  {
    float s = aSeed * 6.2831853;
    float t = uTime * 0.85 + s;
    // uv.y is 0 at the stem, 1 at the tip. The exponent keeps the base planted.
    float blade = pow(uv.y, 1.55);
    float gust = 0.55 + 0.45 * snoise(vec3(aSeed * 12.0, uTime * 0.22, 0.0));
    float bend = uSway * blade * gust;
    transformed.x += sin(t) * bend * 0.30;
    transformed.z += cos(t * 0.81 + s) * bend * 0.24;
    transformed.y -= bend * 0.10 * abs(sin(t * 1.1));
    transformed *= uGrow;
  }
`

/** Sine-tapered leaf, plus a darker midrib. */
const LEAF_FRAGMENT = `
  {
    float halfWidth = pow(sin(vUv.y * 3.14159265), 0.62) * 0.5;
    float dx = abs(vUv.x - 0.5);
    if (dx > halfWidth) discard;
    // midrib: a soft dark line down the centre, and a lighter tip
    float rib = 1.0 - smoothstep(0.0, 0.035, dx);
    diffuseColor.rgb *= mix(1.0, 0.72, rib * 0.85);
    diffuseColor.rgb *= mix(0.88, 1.12, vUv.y);
  }
`

export interface PlantProps {
  quality: QualityTier
  reducedMotion: boolean
  /** base of the foliage, in desk space */
  position: [number, number, number]
  /** 0 → 1, shared with the desk's stagger so the plant grows with its pot */
  grow: IUniform<number>
}

const dummy = new Object3D()
const color = new Color()

export function Plant({ quality, reducedMotion, position, grow }: PlantProps) {
  const mesh = useRef<InstancedMesh>(null)
  const count = COUNT[quality] ?? COUNT.medium
  const swayOn = quality !== 'low' && !reducedMotion

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(LEAF_W, LEAF_H, 1, 4)
    // pivot at the stem, so the sway and the grow both hinge at the pot
    g.translate(0, LEAF_H / 2, 0)
    return g
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 } as IUniform<number>,
      uSway: { value: 0 } as IUniform<number>,
    }),
    [],
  )

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.78,
      metalness: 0,
      side: DoubleSide,
    })
    // vUv is only declared when something asks for it; nothing here uses a map.
    m.defines = { ...(m.defines ?? {}), USE_UV: '' }
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime
      shader.uniforms.uSway = uniforms.uSway
      shader.uniforms.uGrow = grow
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${VERTEX_PRELUDE}\n${SWAY_VERTEX}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${SWAY_BODY}`)
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `#include <color_fragment>\n${LEAF_FRAGMENT}`,
      )
    }
    m.customProgramCacheKey = () => 'about-plant-leaf'
    return m
  }, [uniforms, grow])

  /** Instance transforms and per-leaf colour. Written once. */
  useEffect(() => {
    const m = mesh.current
    if (!m) return

    const seeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const s = hash11(i * 3.17 + 1.7)
      const s2 = hash11(i * 7.91 + 5.3)
      const s3 = hash11(i * 11.3 + 9.1)
      seeds[i] = s

      // three tiers of leaves, fanned around the pot
      const tier = i % 3
      const azimuth = (i / count) * Math.PI * 2 * 2.39996 + s * 0.5 // golden-angle fan
      const outward = 0.42 + tier * 0.22 + s2 * 0.24
      const lift = 0.05 + (2 - tier) * 0.1

      dummy.position.set(0, lift, 0)
      dummy.rotation.set(0, 0, 0)
      dummy.rotateY(azimuth)
      // lean the blade outward; inner tiers stand up, outer tiers arch over
      dummy.rotateX(outward)
      dummy.rotateZ((s3 - 0.5) * 0.5)

      const scale = 0.66 + s2 * 0.5 - tier * 0.06
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, color.copy(GREEN_A).lerp(GREEN_B, s2 * 0.85 + s3 * 0.15))
    }

    m.geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 1))
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [count])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  // No renderPriority — a non-zero priority switches R3F to manual rendering.
  useFrame((_, rawDelta) => {
    if (!swayOn) {
      uniforms.uSway.value = 0
      return
    }
    uniforms.uTime.value += Math.min(rawDelta, 0.1)
    uniforms.uSway.value = 1
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, count]}
      position={position}
      name="about-plant"
      frustumCulled={false}
    />
  )
}
