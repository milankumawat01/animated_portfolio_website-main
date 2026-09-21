'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, Color, Mesh, ShaderMaterial } from 'three'
import { SIMPLEX_3D, glsl } from '@/lib/shader'
import { damp } from '@/lib/math'
import fogFragment from './shaders/fog.frag'

/**
 * Depth for almost nothing: one large inverted sphere the camera sits inside, with a
 * slow noise scroll on the inside face. At 8% additive it is not readable as an
 * object — it just stops the background being flat black behind the particles.
 *
 * 1 draw call, ~1.5k triangles. Off entirely on the `low` tier.
 */

const vertexShader = glsl`
varying vec3 vLocal;

void main() {
  vLocal = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export interface FogVolumeProps {
  /** must comfortably exceed the camera's travel inside the station */
  radius?: number
  color?: string
  opacity?: number
  /** false under reduced motion: the volume stays, the drift stops */
  idle?: boolean
}

export function FogVolume({
  radius = 24,
  color = '#1D4ED8',
  opacity = 0.08,
  idle = true,
}: FogVolumeProps) {
  const mesh = useRef<Mesh>(null)

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader: `${SIMPLEX_3D}\n${fogFragment}`,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(color) },
          uOpacity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        // Writing depth would punch the particles out; not testing it at all would
        // put the haze in front of them. Test, never write.
        depthTest: true,
        side: BackSide,
        blending: AdditiveBlending,
        fog: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => () => material.dispose(), [material])
  useEffect(() => {
    ;(material.uniforms.uColor.value as Color).set(color)
  }, [material, color])

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    if (idle) material.uniforms.uTime.value += dt
    material.uniforms.uOpacity.value = damp(
      material.uniforms.uOpacity.value as number,
      opacity,
      2,
      dt,
    )
    if (mesh.current && idle) mesh.current.rotation.y += dt * 0.008
  })

  return (
    <mesh ref={mesh} name="hero-fog" material={material} frustumCulled={false}>
      <sphereGeometry args={[radius, 32, 24]} />
    </mesh>
  )
}
