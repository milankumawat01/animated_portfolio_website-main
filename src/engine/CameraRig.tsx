'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3, type PerspectiveCamera as ThreePerspectiveCamera } from 'three'
import { getCameraAt } from '@/lib/curves'
import { damp } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'
import { isDebug } from './quality'

/**
 * The camera is driven entirely by scroll. Nothing else moves it.
 *
 * Two layers of smoothing: the CatmullRom path in `lib/curves.ts` is C1-continuous so
 * there is no direction snap at a station boundary, and everything here is damped so
 * a flung scroll arrives rather than jerks.
 */

// Hoisted — useFrame must not allocate.
const targetPos = new Vector3()
const targetLook = new Vector3()
const currentLook = new Vector3()
const forward = new Vector3()
const right = new Vector3()
const localUp = new Vector3()
const WORLD_UP = new Vector3(0, 1, 0)
const parallaxOffset = new Vector3()

/** `?debug=1` readout, so a headless browser can assert the path has no seams. */
const cameraProbe: number[] = [0, 0, 0]

const POSITION_LAMBDA = 6
const LOOK_LAMBDA = 5.5
const FOV_LAMBDA = 4
const PARALLAX_LAMBDA = 3.5
/** Fast scrolling widens the lens by up to this many degrees. */
const FOV_PUMP = 3

export function CameraRig() {
  const ref = useRef<ThreePerspectiveCamera>(null)
  const initialized = useRef(false)
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const size = useThree((s) => s.size)

  const reducedMotion = useQuality((s) => s.reducedMotion)
  const isTouch = useQuality((s) => s.isTouch)
  const parallaxEnabled = !reducedMotion && !isTouch
  const debug = isDebug()

  useFrame((state, rawDelta) => {
    const cam = ref.current
    if (!cam) return

    const dt = Math.min(rawDelta, 0.1)
    const { progress, velocity } = scrollState

    const sample = getCameraAt(progress, targetPos, targetLook)

    // Mouse parallax, in camera-local right/up. Pointer is already -1..1 in R3F.
    if (parallaxEnabled) {
      mouse.current.tx = state.pointer.x
      mouse.current.ty = state.pointer.y
    } else {
      mouse.current.tx = 0
      mouse.current.ty = 0
    }
    mouse.current.x = damp(mouse.current.x, mouse.current.tx, PARALLAX_LAMBDA, dt)
    mouse.current.y = damp(mouse.current.y, mouse.current.ty, PARALLAX_LAMBDA, dt)

    forward.subVectors(targetLook, targetPos).normalize()
    right.crossVectors(forward, WORLD_UP).normalize()
    localUp.crossVectors(right, forward).normalize()

    parallaxOffset
      .copy(right)
      .multiplyScalar(mouse.current.x * sample.parallax)
      .addScaledVector(localUp, mouse.current.y * sample.parallax * 0.6)
    targetPos.add(parallaxOffset)

    if (!initialized.current) {
      cam.position.copy(targetPos)
      currentLook.copy(targetLook)
      cam.fov = sample.fov
      initialized.current = true
    } else {
      cam.position.x = damp(cam.position.x, targetPos.x, POSITION_LAMBDA, dt)
      cam.position.y = damp(cam.position.y, targetPos.y, POSITION_LAMBDA, dt)
      cam.position.z = damp(cam.position.z, targetPos.z, POSITION_LAMBDA, dt)

      currentLook.x = damp(currentLook.x, targetLook.x, LOOK_LAMBDA, dt)
      currentLook.y = damp(currentLook.y, targetLook.y, LOOK_LAMBDA, dt)
      currentLook.z = damp(currentLook.z, targetLook.z, LOOK_LAMBDA, dt)
    }

    // Roll comes from tilting `up` before the lookAt, which is cheaper and more
    // stable than rotating afterwards.
    const roll = reducedMotion ? 0 : sample.roll
    cam.up.set(Math.sin(roll), Math.cos(roll), 0)
    cam.lookAt(currentLook)

    if (debug) {
      cameraProbe[0] = cam.position.x
      cameraProbe[1] = cam.position.y
      cameraProbe[2] = cam.position.z
      ;(window as unknown as { __cameraProbe: number[] }).__cameraProbe = cameraProbe
    }

    const targetFov = sample.fov + (reducedMotion ? 0 : Math.abs(velocity) * FOV_PUMP)
    const nextFov = damp(cam.fov, targetFov, FOV_LAMBDA, dt)
    if (Math.abs(nextFov - cam.fov) > 0.001) {
      cam.fov = nextFov
      cam.updateProjectionMatrix()
    }
  })

  return (
    <PerspectiveCamera
      ref={ref}
      makeDefault
      fov={62}
      near={0.1}
      far={260}
      aspect={size.width / Math.max(size.height, 1)}
      position={[0, 0, 4]}
    />
  )
}
