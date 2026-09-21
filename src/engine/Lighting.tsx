'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { DirectionalLight, HemisphereLight, PointLight } from 'three'
import { lerp } from '@/lib/math'
import { useQuality } from '@/store/useQuality'
import { envState } from './SceneDirector'

/**
 * Three global lights, interpolated by how dark the current station is.
 *
 * `envState.darkness` is 1 inside hero and contact, 0 through the light stations,
 * and slides between them across a boundary — so the lighting cross-fades with the
 * background instead of popping at the seam.
 *
 * Stations may add their own local lights but the scene total must stay at or under
 * six. Budget: 3 here, 3 left for the active station.
 */

const LAMP_WARM = '#F5A524'

export function Lighting() {
  const hemi = useRef<HemisphereLight>(null)
  const key = useRef<DirectionalLight>(null)
  const lamp = useRef<PointLight>(null)
  const shadows = useQuality((s) => s.tier === 'high')

  useFrame(() => {
    const d = envState.darkness

    if (hemi.current) hemi.current.intensity = lerp(0.85, 0.12, d)
    if (key.current) key.current.intensity = lerp(1.35, 0.25, d)
    if (lamp.current) lamp.current.intensity = lerp(2.5, 26, d)
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#DCE8F7', '#8C97A8', 0.85]} />
      <directionalLight
        ref={key}
        position={[6, 12, 8]}
        intensity={1.35}
        color="#FFFFFF"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0005}
      />
      {/* The desk lamp. Carries the two dark stations almost on its own. */}
      <pointLight
        ref={lamp}
        position={[-3.5, 2.6, 2.2]}
        intensity={2.5}
        distance={34}
        decay={2}
        color={LAMP_WARM}
      />
    </>
  )
}
