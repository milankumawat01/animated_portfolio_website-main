'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector3,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { glsl } from '@/lib/shader'
import { saturate, smoothstep } from '@/lib/math'
import { scrollState } from '@/store/useScroll'

/**
 * 06 — HOW I BUILD · the five node frames.
 *
 * THIS FILE IS ALSO THE STATION'S LAYOUT AND TIMING TABLE. Conduit, Glyphs and
 * Scene all import from here, which keeps the dependency graph a tree: nothing in
 * the station imports Scene, so there is no cycle to trip Turbopack over.
 *
 * Five frames, but only TWO draw calls for the lot. Every frame's edges live in one
 * merged `BufferGeometry` carrying an `aNode` index per vertex, and every frame's
 * fill plane lives in a second one. Per-node state — how far it has been built, how
 * hot it is — arrives as five-element uniform arrays and is picked up in the vertex
 * shader with an unrolled constant-index read, the only array indexing GLSL ES 1.0
 * guarantees everywhere.
 *
 * Rounded boxes are authored by hand rather than by running `EdgesGeometry` over a
 * `RoundedBoxGeometry`: the rounded solid has hundreds of nearly-coplanar faces and
 * `EdgesGeometry` either throws all of them away or keeps all of them, depending on
 * the threshold angle. Emitting the two rounded rectangles and their four corner
 * struts directly gives exactly the drawn look for 44 segments a node.
 */

// ------------------------------------------------------------------ layout
/** Five nodes along X, the lateral dolly the camera path is shaped around. */
export const NODE_X = [-14, -7, 0, 7, 14] as const
export const NODE_COUNT = NODE_X.length
export const NODE_Y = 1.7
export const NODE_HW = 2.2
export const NODE_HH = 1.35
export const NODE_HD = 0.75
export const CORNER_R = 0.42
/** The blueprint floor sits here; drop lines from each node land on it. */
export const GRID_Y = -1.05

export const nodeCenter = (i: number): [number, number, number] => [NODE_X[i], NODE_Y, 0]

// ------------------------------------------------------------------ timing
/**
 * The construction schedule, in local station progress.
 *
 * Node `i` builds, then the conduit leaving it draws across to node `i+1`, which is
 * already starting to build as the conduit arrives — an overlap of about 0.03, so
 * the diagram reads as one continuous assembly rather than ten discrete events.
 * Conduit 4 is the feedback loop from Iterate back to Understand and lands last,
 * which is the whole point of `while (curiosity)`.
 */
const NODE_STEP = 0.145
const NODE_START = 0.06
const NODE_LEN = 0.13

export const NODE_WINDOW: readonly (readonly [number, number])[] = NODE_X.map((_, i) => [
  NODE_START + i * NODE_STEP,
  NODE_START + i * NODE_STEP + NODE_LEN,
])

export const CONDUIT_WINDOW: readonly (readonly [number, number])[] = [
  [0.18, 0.295],
  [0.325, 0.44],
  [0.47, 0.585],
  [0.615, 0.73],
  // the loop back to the start
  [0.775, 0.945],
]

/** 0..1 — how much of node `i` has been constructed at local progress `p`. */
export const nodeReveal = (i: number, p: number): number =>
  smoothstep(NODE_WINDOW[i][0], NODE_WINDOW[i][1], p)

/**
 * 0..~1.55 — colour drive for node `i`. Up to 1 it lerps ink → brand; the overshoot
 * above 1 is the flash as the frame completes, which the shaders take toward white.
 */
export const nodeActivation = (i: number, p: number): number => {
  const end = NODE_WINDOW[i][1]
  const d = (p - end) / 0.032
  return nodeReveal(i, p) + Math.exp(-d * d) * 0.55
}

/** 0..1 — how far conduit `i` has drawn itself on. */
export const conduitDraw = (i: number, p: number): number =>
  smoothstep(CONDUIT_WINDOW[i][0], CONDUIT_WINDOW[i][1], p)

/**
 * The `progress` prop is quantized to ~2% steps by `SceneDirector`, and a conduit
 * drawing itself on in 2% jumps is visibly chunky. Read the hot path instead, and
 * fall back to the prop in the mount-padding region where this is not the active
 * station and `scrollState.localProgress` belongs to a neighbour.
 */
export const livePipelineProgress = (fallback: number): number =>
  scrollState.activeStation === 'build' ? scrollState.localProgress : fallback

// ---------------------------------------------------------------- palette
export const INK = new Color('#1B2A41')
export const BRAND = new Color('#2563EB')
export const BRAND_SOFT = new Color('#3B82F6')

// ------------------------------------------------------------------ build
/** Ordered points around a rounded rectangle in the XY plane. */
const roundedRect = (hw: number, hh: number, r: number, arcSeg: number): [number, number][] => {
  const pts: [number, number][] = []
  const cx = hw - r
  const cy = hh - r
  const corners: [number, number, number][] = [
    [cx, cy, 0],
    [-cx, cy, Math.PI / 2],
    [-cx, -cy, Math.PI],
    [cx, -cy, (3 * Math.PI) / 2],
  ]
  for (const [ox, oy, a0] of corners) {
    for (let s = 0; s <= arcSeg; s++) {
      const a = a0 + (s / arcSeg) * (Math.PI / 2)
      pts.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r])
    }
  }
  return pts
}

interface LineSink {
  pos: number[]
  node: number[]
  weight: number[]
}

const segment = (
  sink: LineSink,
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  node: number,
  weight: number,
) => {
  sink.pos.push(a[0], a[1], a[2], b[0], b[1], b[2])
  sink.node.push(node, node)
  sink.weight.push(weight, weight)
}

const buildEdgeGeometry = (arcSeg: number): BufferGeometry => {
  const sink: LineSink = { pos: [], node: [], weight: [] }

  for (let i = 0; i < NODE_COUNT; i++) {
    const x = NODE_X[i]
    const loop = roundedRect(NODE_HW, NODE_HH, CORNER_R, arcSeg)

    // The two faces of the box.
    for (const z of [NODE_HD, -NODE_HD]) {
      for (let s = 0; s < loop.length; s++) {
        const [ax, ay] = loop[s]
        const [bx, by] = loop[(s + 1) % loop.length]
        segment(sink, [x + ax, NODE_Y + ay, z], [x + bx, NODE_Y + by, z], i, 1)
      }
    }

    // Four corner struts, taken at the middle of each corner arc so they meet the
    // rounded part rather than a nonexistent sharp corner.
    const strutIdx = [Math.floor(arcSeg / 2)]
    for (let c = 0; c < 4; c++) {
      for (const k of strutIdx) {
        const [sx, sy] = loop[c * (arcSeg + 1) + k]
        segment(
          sink,
          [x + sx, NODE_Y + sy, NODE_HD],
          [x + sx, NODE_Y + sy, -NODE_HD],
          i,
          0.75,
        )
      }
    }

    // Blueprint annotation: a drop line to the floor and a crosshair where it lands.
    segment(sink, [x, NODE_Y - NODE_HH, 0], [x, GRID_Y, 0], i, 0.35)
    segment(sink, [x - 0.55, GRID_Y, 0], [x + 0.55, GRID_Y, 0], i, 0.5)
    segment(sink, [x, GRID_Y, -0.55], [x, GRID_Y, 0.55], i, 0.5)

    // A ticked baseline under the frame — the step-number gutter of the drawing.
    segment(
      sink,
      [x - NODE_HW, NODE_Y - NODE_HH - 0.34, 0],
      [x + NODE_HW, NODE_Y - NODE_HH - 0.34, 0],
      i,
      0.42,
    )
    // …and `i + 1` ticks on it, so each node is legibly numbered without a texture.
    for (let t = 0; t <= i; t++) {
      const tx = x - NODE_HW + 0.34 + t * 0.34
      segment(
        sink,
        [tx, NODE_Y - NODE_HH - 0.34, 0],
        [tx, NODE_Y - NODE_HH - 0.72, 0],
        i,
        0.85,
      )
    }
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(sink.pos, 3))
  geo.setAttribute('aNode', new Float32BufferAttribute(sink.node, 1))
  geo.setAttribute('aWeight', new Float32BufferAttribute(sink.weight, 1))
  geo.computeBoundingSphere()
  return geo
}

const buildFillGeometry = (): BufferGeometry => {
  const pos: number[] = []
  const uv: number[] = []
  const node: number[] = []
  const index: number[] = []

  const hw = NODE_HW - 0.16
  const hh = NODE_HH - 0.16

  for (let i = 0; i < NODE_COUNT; i++) {
    const x = NODE_X[i]
    const base = i * 4
    pos.push(
      x - hw, NODE_Y - hh, 0,
      x + hw, NODE_Y - hh, 0,
      x + hw, NODE_Y + hh, 0,
      x - hw, NODE_Y + hh, 0,
    )
    uv.push(0, 0, 1, 0, 1, 1, 0, 1)
    node.push(i, i, i, i)
    index.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  geo.setAttribute('aNode', new Float32BufferAttribute(node, 1))
  geo.setIndex(index)
  geo.computeBoundingSphere()
  return geo
}

// ----------------------------------------------------------------- shaders
/**
 * Shared vertex stage. A node grows out of its own centre as it is revealed, so the
 * frame snaps into existence rather than fading up out of nothing.
 */
const NODE_VERT = glsl`
#include <common>
#include <fog_pars_vertex>

attribute float aNode;
#ifdef EDGES
attribute float aWeight;
#endif

uniform vec3 uCenter[5];
uniform float uReveal[5];
uniform float uActive[5];

varying float vActive;
varying float vReveal;
#ifdef EDGES
varying float vWeight;
#else
varying vec2 vUv;
#endif

void main() {
  vec3 centre = vec3(0.0);
  float reveal = 0.0;
  float heat = 0.0;
  for (int i = 0; i < 5; i++) {
    if (i == int(aNode + 0.5)) {
      centre = uCenter[i];
      reveal = uReveal[i];
      heat = uActive[i];
    }
  }

  vActive = heat;
  vReveal = reveal;
  #ifdef EDGES
    vWeight = aWeight;
  #else
    vUv = uv;
  #endif

  vec3 grown = centre + (position - centre) * mix(0.68, 1.0, reveal);
  vec4 mvPosition = modelViewMatrix * vec4(grown, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
`

const EDGE_FRAG = glsl`
#include <common>
#include <fog_pars_fragment>

uniform vec3 uIdle;
uniform vec3 uLive;
uniform float uFade;

varying float vActive;
varying float vReveal;
varying float vWeight;

void main() {
  vec3 col = mix(uIdle, uLive, clamp(vActive, 0.0, 1.0));
  col = mix(col, vec3(1.0), clamp(vActive - 1.0, 0.0, 1.0) * 0.8);
  float alpha = vReveal * vWeight * uFade;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col, alpha);
  #include <fog_fragment>
}
`

const FILL_FRAG = glsl`
#include <common>
#include <fog_pars_fragment>

uniform vec3 uIdle;
uniform vec3 uLive;
uniform float uFade;

varying float vActive;
varying float vReveal;
varying vec2 vUv;

void main() {
  float heat = clamp(vActive, 0.0, 1.0);
  // Soft inner margin so the wash never butts hard against the drawn frame.
  float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  float inset = smoothstep(0.0, 0.09, edge);
  // A faint top-to-bottom gradient, the glass panel of the schematic.
  float sheen = mix(0.78, 1.15, vUv.y);

  vec3 col = mix(uIdle, uLive, heat);
  float alpha = mix(0.08, 0.24, heat) * vReveal * inset * sheen * uFade;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col, alpha);
  #include <fog_fragment>
}
`

// --------------------------------------------------------------- component
export interface NodeFramesProps {
  quality: QualityTier
  reducedMotion: boolean
  progress: number
}

export function NodeFrames({ quality, reducedMotion, progress }: NodeFramesProps) {
  const arcSeg = quality === 'low' ? 2 : 4
  /** The tier table says low draws instantly; reduced motion wants the same. */
  const instant = quality === 'low' || reducedMotion

  const built = useMemo(() => {
    const centres = NODE_X.map((_, i) => new Vector3(...nodeCenter(i)))
    const shared = () => ({
      ...UniformsUtils.clone(UniformsLib.fog),
      uCenter: { value: centres },
      uReveal: { value: new Array<number>(NODE_COUNT).fill(0) },
      uActive: { value: new Array<number>(NODE_COUNT).fill(0) },
      uFade: { value: 0 },
      uIdle: { value: INK },
      uLive: { value: BRAND },
    })

    const edgeGeo = buildEdgeGeometry(arcSeg)
    const edgeMat = new ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: EDGE_FRAG,
      defines: { EDGES: '' },
      uniforms: shared(),
      fog: true,
      transparent: true,
      depthWrite: false,
    })

    const fillGeo = buildFillGeometry()
    const fillMat = new ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: FILL_FRAG,
      uniforms: { ...shared(), uIdle: { value: BRAND_SOFT }, uLive: { value: BRAND } },
      fog: true,
      transparent: true,
      depthWrite: false,
    })

    return { edgeGeo, edgeMat, fillGeo, fillMat }
  }, [arcSeg])

  useEffect(
    () => () => {
      built.edgeGeo.dispose()
      built.edgeMat.dispose()
      built.fillGeo.dispose()
      built.fillMat.dispose()
    },
    [built],
  )

  const fade = useRef(0)

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const p = livePipelineProgress(progress)

    const edgeU = built.edgeMat.uniforms
    const fillU = built.fillMat.uniforms
    const reveal = edgeU.uReveal.value as number[]
    const active = edgeU.uActive.value as number[]
    const fillReveal = fillU.uReveal.value as number[]
    const fillActive = fillU.uActive.value as number[]

    for (let i = 0; i < NODE_COUNT; i++) {
      const r = instant ? 1 : nodeReveal(i, p)
      const a = instant ? 1 : nodeActivation(i, p)
      reveal[i] = r
      active[i] = a
      fillReveal[i] = r
      fillActive[i] = a
    }

    // Entrance only. There is deliberately no fade-out: the camera dollies past the
    // finished diagram, so the last thing you see of this station is the complete
    // drawing, not a dissolve.
    const target = saturate(smoothstep(0.0, 0.05, p))
    fade.current = fade.current + (target - fade.current) * (1 - Math.exp(-9 * dt))
    edgeU.uFade.value = fade.current
    fillU.uFade.value = fade.current
  })

  return (
    <group name="build-nodes">
      <lineSegments args={[built.edgeGeo, built.edgeMat]} frustumCulled={false} />
      <mesh args={[built.fillGeo, built.fillMat]} frustumCulled={false} />
    </group>
  )
}
