'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  LineSegments,
  Matrix4,
  PlaneGeometry,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { postState } from '@/engine/PostFX'
import { clamp, damp, smoothstep } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { skills } from '@/data/skills'
import { ATLAS_CELL_UV, cellUv, getTechAtlas } from './lib/atlas'
import { LEAVES_PER_TIER, buildGraph } from './lib/forceLayout'
import { hoveredIdIn } from '@/store/useInteraction'
import nodeVert from './shaders/node.vert'
import nodeFrag from './shaders/node.frag'
import edgeVert from './shaders/edge.vert'
import edgeFrag from './shaders/edge.frag'

/**
 * The stack, as a structure.
 *
 * Three objects, three draw calls, whatever the tier:
 *   1. an InstancedMesh of icosahedrons — every node's body
 *   2. an InstancedMesh of billboarded quads — every logo, one atlas
 *   3. one LineSegments — every edge
 *
 * Positions come frozen out of `lib/forceLayout`; nothing here simulates. The only
 * per-frame writes are the hover attribute (one float per node), the edge highlight
 * (two floats per edge) and a handful of uniforms.
 */

// -------------------------------------------------------------- palette
// Authored from the design-system tokens; `new Color(hex)` lands in linear space,
// which is what the shaders want.
const HUB_COLOR = new Color('#2563EB')
const LEAF_COLOR = new Color('#CBDDF6')
const EDGE_HUB = new Color('#2563EB')
const EDGE_LEAF = new Color('#8FB8F2')
const EDGE_RING = new Color('#7FA9EE')
const EDGE_SHARED = new Color('#B9C9E2')
const WHITE = new Color('#FFFFFF')
const scratch = new Color()

/**
 * At `low` there are no logo sprites, so a leaf node is the only thing carrying its
 * cluster. Tinting the six clusters apart keeps the 24-node graph readable instead
 * of turning it into an undifferentiated grey shoal.
 */
const leafColor = (cluster: number, low: boolean): Color =>
  low ? scratch.copy(HUB_COLOR).lerp(WHITE, 0.2 + cluster * 0.08) : LEAF_COLOR

// -------------------------------------------------------------- motion
const MAX_ORBIT = (35 * Math.PI) / 180
const IDLE_SPEED = 0.085
/** Seconds of no input before the idle rotation takes over again. */
const RETURN_DELAY = 2
const DRAG_GAIN = 0.0055
const INERTIA_LAMBDA = 3
const RECENTRE_LAMBDA = 1.4

const SPRITE_SCALE = 1.95
const HIGHLIGHT_GROW = 0.3

const tmpMatrix = new Matrix4()

export interface GraphProps {
  quality: QualityTier
  reducedMotion: boolean
  /** local station progress, used only for the entrance fade */
  progress: number
}

export function Graph({ quality, reducedMotion, progress }: GraphProps) {
  const gl = useThree((s) => s.gl)

  const low = quality === 'low'
  const leaves = LEAVES_PER_TIER[quality]
  const layout = useMemo(() => buildGraph(leaves), [leaves])

  const atlas = useMemo(() => (low ? null : getTechAtlas()), [low])

  // ------------------------------------------------------------------ build
  const built = useMemo(() => {
    const nodes = layout.nodes
    const edges = layout.edges
    const count = nodes.length

    // ---- node spheres
    const sphereGeo = new IcosahedronGeometry(1, low ? 0 : 1)
    const nodeRadius = new Float32Array(count)
    const nodeHighlight = new Float32Array(count)
    const nodeColor = new Float32Array(count * 3)

    nodes.forEach((n, i) => {
      nodeRadius[i] = n.radius
      const c = n.isHub ? HUB_COLOR : leafColor(n.cluster, low)
      nodeColor[i * 3] = c.r
      nodeColor[i * 3 + 1] = c.g
      nodeColor[i * 3 + 2] = c.b
    })

    const nodeHighlightAttr = new InstancedBufferAttribute(nodeHighlight, 1)
    nodeHighlightAttr.setUsage(DynamicDrawUsage)
    sphereGeo.setAttribute('aRadius', new InstancedBufferAttribute(nodeRadius, 1))
    sphereGeo.setAttribute('aHighlight', nodeHighlightAttr)
    sphereGeo.setAttribute('aColor', new InstancedBufferAttribute(nodeColor, 3))

    const sphereMat = new ShaderMaterial({
      vertexShader: nodeVert,
      fragmentShader: nodeFrag,
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uDim: { value: 0 },
        uFade: { value: 0 },
        uGrow: { value: HIGHLIGHT_GROW },
      },
      fog: true,
      transparent: true,
      depthWrite: true,
    })

    // ---- logo sprites
    const leafNodes = nodes.map((n, i) => ({ n, i })).filter((e) => !e.n.isHub)
    const spriteCount = atlas ? leafNodes.length : 0

    const spriteGeo = new PlaneGeometry(1, 1)
    const spriteRadius = new Float32Array(Math.max(spriteCount, 1))
    const spriteHighlight = new Float32Array(Math.max(spriteCount, 1))
    const spriteColor = new Float32Array(Math.max(spriteCount, 1) * 3)
    const spriteUv = new Float32Array(Math.max(spriteCount, 1) * 2)

    leafNodes.slice(0, spriteCount).forEach(({ n }, i) => {
      spriteRadius[i] = n.radius
      spriteColor[i * 3] = 1
      spriteColor[i * 3 + 1] = 1
      spriteColor[i * 3 + 2] = 1
      const [u, v] = cellUv(n.cell)
      spriteUv[i * 2] = u
      spriteUv[i * 2 + 1] = v
    })

    const spriteHighlightAttr = new InstancedBufferAttribute(spriteHighlight, 1)
    spriteHighlightAttr.setUsage(DynamicDrawUsage)
    spriteGeo.setAttribute('aRadius', new InstancedBufferAttribute(spriteRadius, 1))
    spriteGeo.setAttribute('aHighlight', spriteHighlightAttr)
    spriteGeo.setAttribute('aColor', new InstancedBufferAttribute(spriteColor, 3))
    spriteGeo.setAttribute('aUvOffset', new InstancedBufferAttribute(spriteUv, 2))

    const spriteMat = new ShaderMaterial({
      vertexShader: nodeVert,
      fragmentShader: nodeFrag,
      defines: { SPRITE: '' },
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uDim: { value: 0 },
        uFade: { value: 0 },
        uGrow: { value: HIGHLIGHT_GROW },
        uAtlas: { value: atlas },
        uCell: { value: ATLAS_CELL_UV },
        uSpriteScale: { value: SPRITE_SCALE },
        uPush: { value: 1.25 },
      },
      fog: true,
      transparent: true,
      depthWrite: false,
    })

    // ---- edges
    const edgeGeo = new BufferGeometry()
    const ePos = new Float32Array(edges.length * 6)
    const eColor = new Float32Array(edges.length * 6)
    const eT = new Float32Array(edges.length * 2)
    const eFlow = new Float32Array(edges.length * 2)
    const eHighlight = new Float32Array(edges.length * 2)

    edges.forEach((e, i) => {
      // `a` is the hub on a spoke, so flip so t = 0 is always the leaf end and the
      // pulse always travels inward.
      const spoke = e.kind === 'spoke'
      const from = spoke ? nodes[e.b] : nodes[e.a]
      const to = spoke ? nodes[e.a] : nodes[e.b]

      ePos[i * 6] = from.x
      ePos[i * 6 + 1] = from.y
      ePos[i * 6 + 2] = from.z
      ePos[i * 6 + 3] = to.x
      ePos[i * 6 + 4] = to.y
      ePos[i * 6 + 5] = to.z

      const cFrom = spoke ? EDGE_LEAF : e.kind === 'ring' ? EDGE_RING : EDGE_SHARED
      const cTo = spoke ? EDGE_HUB : e.kind === 'ring' ? EDGE_RING : EDGE_SHARED
      eColor[i * 6] = cFrom.r
      eColor[i * 6 + 1] = cFrom.g
      eColor[i * 6 + 2] = cFrom.b
      eColor[i * 6 + 3] = cTo.r
      eColor[i * 6 + 4] = cTo.g
      eColor[i * 6 + 5] = cTo.b

      const dx = to.x - from.x
      const dy = to.y - from.y
      const dz = to.z - from.z
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz)

      eT[i * 2] = 0
      eT[i * 2 + 1] = 1
      eFlow[i * 2] = 0
      eFlow[i * 2 + 1] = len
    })

    const edgeHighlightAttr = new Float32BufferAttribute(eHighlight, 1)
    edgeHighlightAttr.setUsage(DynamicDrawUsage)
    edgeGeo.setAttribute('position', new Float32BufferAttribute(ePos, 3))
    edgeGeo.setAttribute('aColor', new Float32BufferAttribute(eColor, 3))
    edgeGeo.setAttribute('aT', new Float32BufferAttribute(eT, 1))
    edgeGeo.setAttribute('aFlow', new Float32BufferAttribute(eFlow, 1))
    edgeGeo.setAttribute('aHighlight', edgeHighlightAttr)
    edgeGeo.computeBoundingSphere()

    const edgeMat = new ShaderMaterial({
      vertexShader: edgeVert,
      fragmentShader: edgeFrag,
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uTime: { value: 0 },
        uDim: { value: 0 },
        uFade: { value: 0 },
        uFlow: { value: low || reducedMotion ? 0 : 1 },
        uSpeed: { value: 0.55 },
        uDensity: { value: 1.35 },
      },
      fog: true,
      transparent: true,
      depthWrite: false,
    })

    return {
      count,
      spriteCount,
      sphereGeo,
      sphereMat,
      spriteGeo,
      spriteMat,
      edgeGeo,
      edgeMat,
      nodeHighlight,
      nodeHighlightAttr,
      spriteHighlight,
      spriteHighlightAttr,
      edgeHighlight: eHighlight,
      edgeHighlightAttr,
      leafClusters: leafNodes.map(({ n }) => n.cluster),
      edgeClusters: edges.map((e) => e.cluster),
      nodeClusters: nodes.map((n) => n.cluster),
    }
  }, [layout, low, reducedMotion, atlas])

  useEffect(
    () => () => {
      built.sphereGeo.dispose()
      built.sphereMat.dispose()
      built.spriteGeo.dispose()
      built.spriteMat.dispose()
      built.edgeGeo.dispose()
      built.edgeMat.dispose()
    },
    [built],
  )

  // ------------------------------------------------------------ placement
  const spheres = useRef<InstancedMesh>(null)
  const sprites = useRef<InstancedMesh>(null)
  const edgesRef = useRef<LineSegments>(null)
  const orbitGroup = useRef<Group>(null)

  useEffect(() => {
    const mesh = spheres.current
    if (mesh) {
      layout.nodes.forEach((n, i) => {
        tmpMatrix.makeTranslation(n.x, n.y, n.z)
        mesh.setMatrixAt(i, tmpMatrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    }
    const sprite = sprites.current
    if (sprite) {
      let i = 0
      for (const n of layout.nodes) {
        if (n.isHub) continue
        tmpMatrix.makeTranslation(n.x, n.y, n.z)
        sprite.setMatrixAt(i, tmpMatrix)
        i++
      }
      sprite.instanceMatrix.needsUpdate = true
    }
  }, [layout, built])

  // ---------------------------------------------------------- drag orbit
  const orbit = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    velX: 0,
    velY: 0,
    offX: 0,
    offY: 0,
    idle: 0,
    sinceInput: 999,
  })

  useEffect(() => {
    // Drag is a medium/high affordance. Reduced motion keeps it — it is navigation
    // the user asked for, not decoration.
    if (low) return

    const el = gl.domElement
    const o = orbit.current

    // THE POINTER-EVENTS CONTRACT. The canvas is `pointer-events: none` globally so
    // every DOM link works; Skills borrows it back for as long as it is mounted and
    // hands it straight back. Leaking `auto` here would silently break every station
    // after this one, so the restore lives in the cleanup and nowhere else.
    const prevPointerEvents = el.style.pointerEvents
    const prevTouchAction = el.style.touchAction
    const prevCursor = el.style.cursor
    el.style.pointerEvents = 'auto'
    el.style.touchAction = 'pan-y'
    el.style.cursor = 'grab'

    const onDown = (e: PointerEvent) => {
      o.dragging = true
      o.lastX = e.clientX
      o.lastY = e.clientY
      o.lastT = e.timeStamp
      o.velX = 0
      o.velY = 0
      o.sinceInput = 0
      el.style.cursor = 'grabbing'
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* capture is a nicety, not a requirement */
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!o.dragging) return
      const dx = e.clientX - o.lastX
      const dy = e.clientY - o.lastY
      const dt = Math.max((e.timeStamp - o.lastT) / 1000, 1 / 240)
      o.lastX = e.clientX
      o.lastY = e.clientY
      o.lastT = e.timeStamp
      o.sinceInput = 0

      o.offY += dx * DRAG_GAIN
      o.offX += dy * DRAG_GAIN
      // Throw velocity, smoothed so one jittery sample cannot fling the graph.
      o.velY = ((dx * DRAG_GAIN) / dt) * 0.55 + o.velY * 0.45
      o.velX = ((dy * DRAG_GAIN) / dt) * 0.55 + o.velX * 0.45
    }

    const onUp = (e: PointerEvent) => {
      if (!o.dragging) return
      o.dragging = false
      o.sinceInput = 0
      el.style.cursor = 'grab'
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('lostpointercapture', onUp)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('lostpointercapture', onUp)
      o.dragging = false
      el.style.pointerEvents = prevPointerEvents
      el.style.touchAction = prevTouchAction
      el.style.cursor = prevCursor
    }
  }, [gl, low])

  // ------------------------------------------------------------ per frame
  const smooth = useRef({ dim: 0, fade: 0, time: 0 })

  const fadeTarget =
    smoothstep(0.01, 0.16, progress) * (1 - smoothstep(0.93, 1, progress))

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const s = smooth.current
    const o = orbit.current
    const b = built

    // --- highlight ---------------------------------------------------------
    const hovered = hoveredIdIn('skills')
    const hoveredIndex = hovered ? skills.findIndex((c) => c.id === hovered) : -1
    s.dim = damp(s.dim, hoveredIndex >= 0 ? 1 : 0, 9, dt)

    for (let i = 0; i < b.count; i++) {
      const target = b.nodeClusters[i] === hoveredIndex ? 1 : 0
      b.nodeHighlight[i] = damp(b.nodeHighlight[i], target, 10, dt)
    }
    b.nodeHighlightAttr.needsUpdate = true

    for (let i = 0; i < b.spriteCount; i++) {
      const target = b.leafClusters[i] === hoveredIndex ? 1 : 0
      b.spriteHighlight[i] = damp(b.spriteHighlight[i], target, 10, dt)
    }
    if (b.spriteCount > 0) b.spriteHighlightAttr.needsUpdate = true

    for (let i = 0; i < b.edgeClusters.length; i++) {
      const target = b.edgeClusters[i] === hoveredIndex ? 1 : 0
      const v = damp(b.edgeHighlight[i * 2], target, 10, dt)
      b.edgeHighlight[i * 2] = v
      b.edgeHighlight[i * 2 + 1] = v
    }
    b.edgeHighlightAttr.needsUpdate = true

    // --- fade and flow -----------------------------------------------------
    s.fade = damp(s.fade, fadeTarget, 5, dt)
    s.time += dt

    b.sphereMat.uniforms.uDim.value = s.dim
    b.sphereMat.uniforms.uFade.value = s.fade
    b.spriteMat.uniforms.uDim.value = s.dim
    b.spriteMat.uniforms.uFade.value = s.fade
    b.edgeMat.uniforms.uDim.value = s.dim
    b.edgeMat.uniforms.uFade.value = s.fade
    b.edgeMat.uniforms.uTime.value = s.time

    // --- orbit -------------------------------------------------------------
    if (!o.dragging) {
      o.sinceInput += dt
      o.offY += o.velY * dt
      o.offX += o.velX * dt
      o.velY = damp(o.velY, 0, INERTIA_LAMBDA, dt)
      o.velX = damp(o.velX, 0, INERTIA_LAMBDA, dt)

      if (o.sinceInput > RETURN_DELAY) {
        o.offX = damp(o.offX, 0, RECENTRE_LAMBDA, dt)
        o.offY = damp(o.offY, 0, RECENTRE_LAMBDA, dt)
        if (!reducedMotion) o.idle += dt * IDLE_SPEED
      }
    }

    o.offX = clamp(o.offX, -MAX_ORBIT, MAX_ORBIT)
    o.offY = clamp(o.offY, -MAX_ORBIT, MAX_ORBIT)

    const g = orbitGroup.current
    if (g) {
      g.rotation.set(o.offX, o.idle + o.offY, 0)
      const scale = 0.9 + 0.1 * s.fade
      g.scale.setScalar(scale)
    }

    // --- post --------------------------------------------------------------
    // Flat and calm. Less bloom than the default so the white nodes stay crisp
    // against the light background instead of blooming into it.
    if (scrollState.activeStation === 'skills') {
      postState.bloomIntensity = 0.5
      postState.bloomThreshold = 0.88
      postState.vignette = 0.3
      // The graph sits ~14 world units out and the camera is near 0.1 / far 260,
      // so the focal plane belongs at (14 - near) / (far - near) ≈ 0.054. The 0.02
      // default focuses at ~5 units and turned the whole station into mush.
      postState.dofFocusDistance = 0.054
      postState.dofBokehScale = 0.8
    }
  })

  return (
    <group ref={orbitGroup} name="skills-graph">
      <lineSegments ref={edgesRef} args={[built.edgeGeo, built.edgeMat]} frustumCulled={false} />
      <instancedMesh
        ref={spheres}
        args={[built.sphereGeo, built.sphereMat, built.count]}
        frustumCulled={false}
      />
      {built.spriteCount > 0 ? (
        <instancedMesh
          ref={sprites}
          args={[built.spriteGeo, built.spriteMat, built.spriteCount]}
          frustumCulled={false}
        />
      ) : null}
    </group>
  )
}
