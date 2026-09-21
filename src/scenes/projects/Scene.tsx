'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import {
  ExtrudeGeometry,
  Material,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Shape,
  Vector3,
  type Group,
  type InstancedMesh,
  type PointLight,
} from 'three'
import type { SceneProps } from '@/engine/types'
import { projects } from '@/data/projects'
import { STATION_RANGES } from '@/lib/curves'
import { clamp, damp, saturate } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { postState } from '@/engine/PostFX'
import { Caustics } from './Caustics'
import { Slab, type SlabActivity } from './Slab'
import { hoveredIdIn } from '@/store/useInteraction'

/**
 * PROJECTS — "four things that shipped".
 *
 * Four glass slabs on a shallow arc around the station's local origin. Station
 * progress turns the arc: p 0 → 1 traverses three slab positions, so the carousel
 * advances by scrolling and never needs a click. The active slab lifts, scales and
 * squares up to camera; DOF locks onto it.
 *
 * THE PERFORMANCE DECISION: `MeshTransmissionMaterial` renders the whole scene into
 * an FBO once per *material instance*, every frame. Four instances would be four
 * extra full-scene renders and the station would not hold frame. So exactly one
 * material is created — as a child of slab 0 — and the other three slabs are handed
 * the same object once it exists. Do not turn this back into four `<Slab>`s each
 * owning their own material.
 */

const [RANGE_START, RANGE_END] = STATION_RANGES.projects

/** Arc radius. Large relative to the step, which is what makes the arc shallow. */
const ARC_RADIUS = 9
/**
 * Angular gap between slabs, radians. 9 · sin(0.345) ≈ 3.04 units of lateral pitch,
 * which holds the same slab-width-to-gap ratio now that the slabs are larger.
 */
const ARC_STEP = 0.345
/**
 * The arc rides above the camera's look target. The DOM cards occupy the lower third
 * of the viewport for this whole station, so the slabs have to sit in the band
 * between the intro paragraph and the card row rather than on the horizon.
 */
const BASE_Y = 1.2
const ACTIVE_LIFT = 0.4
const ACTIVE_SCALE = 0.08
/** 6°, the hover tilt ceiling from the scene bible. */
const HOVER_TILT = 0.1047
/** Lean of the caustic pools, on top of the geometry's baked -90° X rotation. */
const CAUSTIC_TILT = 1.0

/**
 * Scaled up 1.35x from the scene bible's 1.6 x 1.0. The bible sizes the slabs for a
 * close read, but the camera path only closes to ~8 units at the very end of this
 * station and sits ~18 units out through the middle of it — at the original size
 * the whole carousel rendered as a ~40px thumbnail strip and the DOM cards were
 * carrying the entire section. The arc step scales with them.
 */
const SLAB_W = 2.16
const SLAB_H = 1.35
/**
 * Depth is 0.06 and must stay there: `Slab.tsx` hardcodes `HALF_DEPTH = 0.03` and
 * positions the screenshot plane against it. Deepening the slab without changing
 * that constant buries the screenshot inside the slab body, which renders as a
 * blank grey panel — found exactly that way.
 */
const SLAB_D = 0.06

const CAROUSEL_LAMBDA = 5.5

/**
 * Normalised cursor, -1..1. The canvas is `pointer-events: none`, so R3F's own
 * `state.pointer` never updates — the slabs have to read the window directly.
 */
const cursor = { x: 0, y: 0 }

const tmpVec = new Vector3()
const dummy = new Object3D()

const makeRoundedBox = (w: number, h: number, d: number, radius: number): ExtrudeGeometry => {
  const eps = 0.00001
  const r = radius - eps
  const shape = new Shape()
  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true)
  shape.absarc(eps, h - r * 2, eps, Math.PI, Math.PI / 2, true)
  shape.absarc(w - r * 2, h - r * 2, eps, Math.PI / 2, 0, true)
  shape.absarc(w - r * 2, eps, eps, 0, -Math.PI / 2, true)

  const geo = new ExtrudeGeometry(shape, {
    depth: d - radius * 2,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: radius - eps,
    bevelThickness: radius,
    curveSegments: 4,
  })
  geo.center()
  geo.computeVertexNormals()
  return geo
}

export function ProjectsScene({ quality, reducedMotion }: SceneProps) {
  const low = quality === 'low'
  const camera = useThree((s) => s.camera)

  const slabRefs = useRef<(Group | null)[]>([])
  const causticsRef = useRef<InstancedMesh>(null)
  const rimRef = useRef<PointLight>(null)
  const backRef = useRef<PointLight>(null)
  const carousel = useRef({ t: 0, clock: 0 })

  /** Written by this component's useFrame, read by each Slab's own useFrame. */
  const activity = useMemo<SlabActivity[]>(() => projects.map(() => ({ active: 0 })), [])

  /** The one and only transmission material, captured from slab 0. */
  const [glass, setGlass] = useState<Material | null>(null)

  const slabGeometry = useMemo(() => makeRoundedBox(SLAB_W, SLAB_H, SLAB_D, 0.026), [])
  const planeGeometry = useMemo(
    () => new PlaneGeometry(SLAB_W - 0.1, SLAB_H - 0.09, 24, 16),
    [],
  )

  /** Slab body at `low`, and the one-frame stand-in before the glass mounts. */
  const opaque = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#E8F0FB',
        roughness: 0.22,
        metalness: 0.08,
        envMapIntensity: 0.7,
      }),
    [],
  )

  useEffect(
    () => () => {
      slabGeometry.dispose()
      planeGeometry.dispose()
      opaque.dispose()
    },
    [slabGeometry, planeGeometry, opaque],
  )

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cursor.x = (e.clientX / window.innerWidth) * 2 - 1
      cursor.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const setSlabRef = useMemo(
    () => projects.map((_, i) => (g: Group | null) => { slabRefs.current[i] = g }),
    [],
  )

  // No renderPriority — a non-zero priority switches R3F to manual rendering and
  // nothing on the page draws.
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const c = carousel.current
    c.clock += dt

    // The `progress` prop is quantized to 2% steps — far too coarse to drive a
    // carousel from. Derive local progress off the hot path instead.
    const span = RANGE_END - RANGE_START
    const local = clamp((scrollState.progress - RANGE_START) / span, 0, 1)

    // p maps onto a three-slab traverse: slab 0 centred at entry, slab 3 at exit.
    const targetT = local * (projects.length - 1)
    c.t = reducedMotion ? targetT : damp(c.t, targetT, CAROUSEL_LAMBDA, dt)

    const hovered = hoveredIdIn('projects')
    const activeIndex = clamp(Math.round(c.t), 0, projects.length - 1)
    const idle = reducedMotion ? 0 : 1

    let activeX = 0
    let activeY = BASE_Y
    let activeZ = 0

    for (let i = 0; i < projects.length; i++) {
      const g = slabRefs.current[i]
      const theta = (i - c.t) * ARC_STEP
      const x = ARC_RADIUS * Math.sin(theta)
      const z = -ARC_RADIUS + ARC_RADIUS * Math.cos(theta)

      const a = saturate(1 - Math.abs(i - c.t))
      activity[i].active = a

      if (!g) continue

      // Hover is binary; 180ms is the design system's hover duration, so lambda ≈ 12.
      const isHovered = hovered === projects[i].id
      const h = damp((g.userData.hover as number | undefined) ?? 0, isHovered ? 1 : 0, 12, dt)
      g.userData.hover = h

      const bob = idle * Math.sin(c.clock * 0.8 + i * 1.7) * 0.022
      g.position.set(x, BASE_Y + ACTIVE_LIFT * a + bob + 0.05 * h, z)

      // Square the active slab up to camera rather than leaving it on the arc normal.
      g.rotation.y = -theta * (1 - 0.55 * a) + cursor.x * HOVER_TILT * h
      g.rotation.x = -cursor.y * HOVER_TILT * h
      g.rotation.z = idle * Math.sin(c.clock * 0.55 + i * 2.3) * 0.008

      const s = 1 + ACTIVE_SCALE * a + 0.02 * h
      g.scale.setScalar(s)

      if (i === activeIndex) {
        activeX = g.position.x
        activeY = g.position.y
        activeZ = g.position.z
      }

      if (causticsRef.current) {
        dummy.position.set(x, BASE_Y - 0.66 - 0.06 * a, z + 0.04)
        // The pool is tilted, not flat. The camera path runs at roughly slab height
        // for this whole station — a horizontal plane is seen at ~7° and collapses to
        // a 20px smear. Leaning it up toward the viewer is what makes it read.
        dummy.rotation.set(CAUSTIC_TILT, -theta, 0)
        dummy.scale.set(1.95 * (1 + 0.12 * a), 1, 1.3 * (1 + 0.12 * a))
        dummy.updateMatrix()
        causticsRef.current.setMatrixAt(i, dummy.matrix)
      }
    }

    if (causticsRef.current) causticsRef.current.instanceMatrix.needsUpdate = true

    // Rim light rides the active slab; hover pushes it harder. Two extra lights on
    // top of the global three, which is inside the six-light ceiling.
    const anyHover = hovered !== null ? 1 : 0
    if (rimRef.current) {
      const l = rimRef.current
      l.position.set(
        damp(l.position.x, activeX + 1.5, 6, dt),
        damp(l.position.y, activeY + 1.4, 6, dt),
        damp(l.position.z, activeZ + 1.9, 6, dt),
      )
      l.intensity = damp(l.intensity, low ? 5 : 9 + anyHover * 7, 5, dt)
    }
    if (backRef.current) {
      const l = backRef.current
      l.position.set(
        damp(l.position.x, activeX - 1.2, 6, dt),
        damp(l.position.y, activeY + 0.4, 6, dt),
        damp(l.position.z, activeZ - 2.4, 6, dt),
      )
    }

    // DOF exists only at `high`. Focus is postprocessing's normalised world depth:
    // (distance - near) / (far - near), which is why 8 units reads as ~0.03.
    if (quality === 'high' && scrollState.activeStation === 'projects') {
      const g = slabRefs.current[activeIndex]
      if (g) {
        g.getWorldPosition(tmpVec)
        const dist = camera.position.distanceTo(tmpVec)
        const near = 'near' in camera ? (camera.near as number) : 0.1
        const far = 'far' in camera ? (camera.far as number) : 260
        postState.dofFocusDistance = clamp((dist - near) / (far - near), 0.004, 0.4)
        postState.dofBokehScale = 2.2
      }
    }
  })

  return (
    <group name="projects-station">
      {/* Two local lights. Global Lighting already provides three. */}
      <pointLight
        ref={rimRef}
        position={[1.5, 1.6, 2]}
        intensity={9}
        distance={16}
        decay={2}
        color="#EAF3FF"
      />
      <pointLight
        ref={backRef}
        position={[-1.2, 0.6, -2.4]}
        intensity={6}
        distance={14}
        decay={2}
        color="#2F6BD8"
      />

      {projects.map((project, i) => {
        const hostsGlass = !low && i === 0
        return (
          <Slab
            key={project.id}
            project={project}
            index={i}
            quality={quality}
            reducedMotion={reducedMotion}
            slabGeometry={slabGeometry}
            planeGeometry={planeGeometry}
            material={hostsGlass ? undefined : low ? opaque : (glass ?? opaque)}
            activity={activity[i]}
            groupRef={setSlabRef[i]}
          >
            {hostsGlass ? (
              <MeshTransmissionMaterial
                ref={(m) => {
                  setGlass((m as unknown as Material | null) ?? null)
                }}
                samples={quality === 'high' ? 6 : 2}
                resolution={quality === 'high' ? 1024 : 512}
                transmission={1}
                thickness={0.3}
                roughness={0.05}
                chromaticAberration={0.04}
                anisotropicBlur={0.08}
                distortion={0}
                temporalDistortion={0}
                ior={1.45}
                attenuationDistance={4}
                attenuationColor="#EAF2FF"
                color="#FFFFFF"
                backside={false}
              />
            ) : null}
          </Slab>
        )
      })}

      {/* `high` and `medium` only — the low tier has no caustics at all. */}
      {!low ? <Caustics ref={causticsRef} count={projects.length} opacity={0.3} /> : null}
    </group>
  )
}
