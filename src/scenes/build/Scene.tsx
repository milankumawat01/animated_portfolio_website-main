'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { SceneProps } from '@/engine/types'

/**
 * P1 STUB — replaced wholesale by P3Fthe station agent that owns this folder.
 * A single wireframe volume so the camera path is visible end to end.
 */
export function BuildScene({ progress, quality, reducedMotion }: SceneProps) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return
    group.current.rotation.y += delta * 0.12
  })

  return (
    <group ref={group} name="build-stub">
      <mesh>
        <boxGeometry args={[24, 3, 3]} />
        <meshBasicMaterial color="#1B2A41" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh scale={0.2 + progress * 0.5}>
        <icosahedronGeometry args={[1, quality === 'low' ? 0 : 1]} />
        <meshStandardMaterial color="#1B2A41" roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  )
}
