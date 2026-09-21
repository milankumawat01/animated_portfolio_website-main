'use client'

import { forwardRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
} from 'three'
import { FRAGMENT_PRELUDE, glsl } from '@/lib/shader'
import causticsFrag from './shaders/caustics.frag'

/**
 * The four caustic pools, as one instanced draw call with one shared material.
 *
 * The instance matrices are written by `Scene.tsx` — the pools have to follow the
 * slabs as the carousel turns, and the scene already computes those positions every
 * frame, so duplicating that here would just be a second source of truth.
 */

const VERT = glsl`
attribute float aSeed;

varying vec2 vUv;
varying float vSeed;

void main() {
  vUv = uv;
  vSeed = aSeed;

  #ifdef USE_INSTANCING
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  #else
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
  #endif

  gl_Position = projectionMatrix * mv;
}
`

export interface CausticsProps {
  count: number
  /** additive strength; the scene fades this out as the station leaves frame */
  opacity?: number
}

export const Caustics = forwardRef<InstancedMesh, CausticsProps>(function Caustics(
  { count, opacity = 0.3 },
  ref,
) {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(1, 1, 1, 1)
    // Lie flat. Baking the rotation in keeps the instance matrices to scale+position.
    g.rotateX(-Math.PI / 2)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) seeds[i] = i * 0.37 + 0.11
    g.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 1))
    return g
  }, [count])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: `${FRAGMENT_PRELUDE}\n${causticsFrag}`,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: opacity },
          uColor: { value: new Color('#EAF3FF') },
          uShadow: { value: new Color('#7C93B4') },
        },
        transparent: true,
        blending: NormalBlending,
        depthWrite: false,
        side: DoubleSide,
        toneMapped: false,
        fog: false,
      }),
    // opacity is pushed through the uniform below, not by rebuilding the material
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  // No renderPriority — a non-zero priority flips R3F to manual rendering.
  useFrame((_, delta) => {
    material.uniforms.uTime.value += Math.min(delta, 0.1)
    material.uniforms.uOpacity.value = opacity
  })

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, count]}
      frustumCulled={false}
      renderOrder={2}
    />
  )
})
