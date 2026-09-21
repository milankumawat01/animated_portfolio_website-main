'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  ShaderMaterial,
  TubeGeometry,
  UniformsLib,
  UniformsUtils,
  Vector3,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { FRAGMENT_PRELUDE, VERTEX_PRELUDE } from '@/lib/shader'
import { saturate, smoothstep } from '@/lib/math'
import {
  BRAND,
  CONDUIT_WINDOW,
  GRID_Y,
  INK,
  NODE_COUNT,
  NODE_HW,
  NODE_X,
  NODE_Y,
  conduitDraw,
  livePipelineProgress,
} from './NodeFrame'
import dashVert from './shaders/dash.vert'
import dashFrag from './shaders/dash.frag'

/**
 * 06 — HOW I BUILD · the conduits. **The core effect of the station.**
 *
 * Five tubes: four carrying the pipeline forward between consecutive nodes, and one
 * feedback loop running back under the whole diagram from Iterate to Understand —
 * `while (curiosity)` drawn as a circuit rather than described in a caption. It is
 * the last thing to arrive, so finishing the scroll closes the loop.
 *
 * All five are ONE merged geometry and ONE draw call, which is the budget line the
 * phase brief calls out. Each vertex carries `aConduit` (which tube) and `aSpan`
 * (that tube's arc length, so the dash pitch is physical rather than per-tube), and
 * the per-tube draw-on amount arrives as a `uDraw[5]` uniform array.
 *
 * Draw-on is a hard clip in the fragment shader against TubeGeometry's `uv.x`, not
 * a fade: the tube genuinely does not exist ahead of the head, so the diagram
 * constructs itself on the way down and takes itself apart on the way back up, with
 * no state to get out of sync.
 */

const TUBE_RADIUS = 0.105
/** dashes per world unit */
const DASH_PITCH = 1.5

/** Arc-length-resampled so the dash pattern does not bunch up in the tight bends. */
const evenCurve = (points: Vector3[], samples: number): CatmullRomCurve3 => {
  const raw = new CatmullRomCurve3(points, false, 'centripetal', 0.5)
  return new CatmullRomCurve3(raw.getSpacedPoints(samples), false, 'centripetal', 0.5)
}

/** The four forward hops, each bowed slightly toward the camera and alternating in Y. */
const forwardPath = (i: number): Vector3[] => {
  const ax = NODE_X[i] + NODE_HW
  const bx = NODE_X[i + 1] - NODE_HW
  const midX = (ax + bx) / 2
  const lift = i % 2 === 0 ? 0.4 : -0.4
  return [
    new Vector3(ax, NODE_Y, 0),
    new Vector3(midX, NODE_Y + lift, 0.55),
    new Vector3(bx, NODE_Y, 0),
  ]
}

/** The feedback loop: out of node 05, down in front of the drawing, back into 01. */
const loopPath = (): Vector3[] => {
  const right = NODE_X[NODE_COUNT - 1] + NODE_HW
  const left = NODE_X[0] - NODE_HW
  const floor = GRID_Y + 0.42
  return [
    new Vector3(right, NODE_Y, 0),
    new Vector3(right + 2.2, NODE_Y - 0.5, 1.2),
    new Vector3(right + 1.9, floor + 0.5, 2.5),
    new Vector3(right * 0.55, floor, 2.9),
    new Vector3(0, floor - 0.08, 3.0),
    new Vector3(left * 0.55, floor, 2.9),
    new Vector3(left - 1.9, floor + 0.5, 2.5),
    new Vector3(left - 2.2, NODE_Y - 0.5, 1.2),
    new Vector3(left, NODE_Y, 0),
  ]
}

const buildConduits = (quality: QualityTier): BufferGeometry => {
  const low = quality === 'low'
  const radial = low ? 4 : 6
  const density = low ? 1.1 : quality === 'medium' ? 1.8 : 2.4

  const position: number[] = []
  const normal: number[] = []
  const uv: number[] = []
  const conduit: number[] = []
  const span: number[] = []
  const index: number[] = []
  let vertexOffset = 0

  for (let i = 0; i < 5; i++) {
    const pts = i < NODE_COUNT - 1 ? forwardPath(i) : loopPath()
    const curve = evenCurve(pts, low ? 40 : 96)
    const length = curve.getLength()

    const tubular = Math.max(8, Math.round(length * density))
    const tube = new TubeGeometry(curve, tubular, TUBE_RADIUS, radial, false)

    const tp = tube.getAttribute('position')
    const tn = tube.getAttribute('normal')
    const tu = tube.getAttribute('uv')
    const ti = tube.getIndex()

    for (let v = 0; v < tp.count; v++) {
      position.push(tp.getX(v), tp.getY(v), tp.getZ(v))
      normal.push(tn.getX(v), tn.getY(v), tn.getZ(v))
      uv.push(tu.getX(v), tu.getY(v))
      conduit.push(i)
      span.push(length)
    }
    if (ti) {
      for (let k = 0; k < ti.count; k++) index.push(ti.getX(k) + vertexOffset)
    }
    vertexOffset += tp.count
    tube.dispose()
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(position, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normal, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geometry.setAttribute('aConduit', new Float32BufferAttribute(conduit, 1))
  geometry.setAttribute('aSpan', new Float32BufferAttribute(span, 1))
  geometry.setIndex(index)
  geometry.computeBoundingSphere()

  return geometry
}

export interface ConduitsProps {
  quality: QualityTier
  reducedMotion: boolean
  progress: number
}

export function Conduits({ quality, reducedMotion, progress }: ConduitsProps) {
  const low = quality === 'low'
  /** Low tier and reduced motion both show the finished diagram, not a frozen build. */
  const instant = low || reducedMotion
  const flowing = !instant

  const built = useMemo(() => {
    const geometry = buildConduits(quality)

    const material = new ShaderMaterial({
      vertexShader: `${VERTEX_PRELUDE}\n${dashVert}`,
      fragmentShader: `${FRAGMENT_PRELUDE}\n${dashFrag}`,
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uTime: { value: 0 },
        uFlow: { value: flowing ? 1 : 0 },
        uSpeed: { value: 0.9 },
        uPitch: { value: DASH_PITCH },
        uFade: { value: 0 },
        uIdle: { value: INK },
        uLive: { value: BRAND },
        uDraw: { value: new Array<number>(5).fill(instant ? 1 : 0) },
        uActive: { value: new Array<number>(5).fill(instant ? 1 : 0) },
      },
      fog: true,
      transparent: true,
      depthWrite: false,
    })

    return { geometry, material }
  }, [quality, flowing, instant])

  useEffect(
    () => () => {
      built.geometry.dispose()
      built.material.dispose()
    },
    [built],
  )

  const clock = useRef(0)
  const fade = useRef(0)

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const u = built.material.uniforms
    const p = livePipelineProgress(progress)

    if (flowing) {
      clock.current += dt
      u.uTime.value = clock.current
    }

    const draw = u.uDraw.value as number[]
    const active = u.uActive.value as number[]
    for (let i = 0; i < 5; i++) {
      if (instant) {
        // `?q=low` and reduced motion get the complete wireframe, immediately. The
        // pipeline still has to READ as a pipeline there, so nothing is omitted —
        // only the animation is.
        draw[i] = 1
        active[i] = 1
        continue
      }
      const d = conduitDraw(i, p)
      const end = CONDUIT_WINDOW[i][1]
      const g = (p - end) / 0.035
      draw[i] = d
      active[i] = d + Math.exp(-g * g) * 0.5
    }

    const target = saturate(smoothstep(0.0, 0.05, p))
    fade.current += (target - fade.current) * (1 - Math.exp(-9 * dt))
    u.uFade.value = fade.current
  })

  return (
    <mesh
      name="build-conduits"
      args={[built.geometry, built.material]}
      frustumCulled={false}
    />
  )
}
