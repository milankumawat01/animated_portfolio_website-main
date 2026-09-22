'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  CircleGeometry,
  LinearFilter,
  MeshBasicMaterial,
  Vector3,
  type Group,
  type IUniform,
  type PointLight,
} from 'three'
import type { SceneProps } from '@/engine/types'
import { STATION_RANGES } from '@/lib/curves'
import { clamp, lerp, remapClamped, saturate, smoothstep } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { postState } from '@/engine/PostFX'
import { createDeskGroup, getDeskHandle } from './desk'
import { createScreenTexture } from './ScreenTexture'
import { Plant } from './Plant'
import { Portrait } from './Portrait'
import { StationLights } from '@/engine/StationLights'

/**
 * 02 — ABOUT · "The idea gets a desk"
 *
 * The hero's particles land as furniture. A low-poly isometric desk assembles out
 * of the fog object by object, with an `easeOutBack` overshoot, between local
 * progress 0.03 and 0.50 — by the time the camera has finished its orbit the desk
 * is built and only the screens, the plant and the portrait are still moving.
 *
 * THREE THINGS WORTH KNOWING BEFORE EDITING
 *
 * 1. The desk is not a React tree. `desk.ts` builds it as a plain `THREE.Group` so
 *    P3H can drop the same object into Contact, and it merges ~24 primitives into
 *    four meshes by material. The per-object stagger therefore happens in the
 *    vertex shader, driven by the single `reveal` uniform this file owns.
 *
 * 2. Everything is authored in DESK SPACE — the desk surface is y = 0.09 and the
 *    desk is centred on the local origin. `SceneDirector` puts the whole group at
 *    the station anchor [6, 0, -40]. The camera arrives at roughly local
 *    (-3, 5, 22) and orbits to (3.5, 2.8, 7.5), so the desk is read from 22 units
 *    out on arrival and 9 units out on exit. It is sized for that mid-station 14
 *    units, not for the close-up.
 *
 * 3. The camera path in `lib/curves.ts` swings ~33° of azimuth around this station.
 *    The group adds a further ~11° of counter-yaw across `p`, which is what turns
 *    "sliding past a desk" into "circling one". Nothing else here rotates.
 */

const [RANGE_START, RANGE_END] = STATION_RANGES.about

/** Drops the desk so its visual centre sits on the camera's look target. */
const GROUP_Y = -0.55

/** Counter-yaw, radians. Runs against the camera's own swing. */
const YAW_FROM = 0.26
const YAW_TO = 0.04

/** The window of local progress the assembly occupies. */
const BUILD_FROM = 0.03
const BUILD_TO = 0.5

const tmp = new Vector3()

/* -------------------------------------------------------------------------- */
/* Contact shadow                                                              */
/* -------------------------------------------------------------------------- */

/**
 * There is no floor at this station and no shadow map below `high`, so the desk
 * would otherwise float in an infinite pale void. One soft radial blob, one draw
 * call, does the entire job of grounding it.
 */
const makeShadowTexture = (): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(24,42,72,0.46)')
    g.addColorStop(0.45, 'rgba(24,42,72,0.22)')
    g.addColorStop(1, 'rgba(24,42,72,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
  }
  const tex = new CanvasTexture(canvas)
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  tex.generateMipmaps = false
  return tex
}

/* -------------------------------------------------------------------------- */

export function AboutScene({ quality, reducedMotion }: SceneProps) {
  const camera = useThree((s) => s.camera)
  const root = useRef<Group>(null)
  const lampLight = useRef<PointLight>(null)

  const instant = reducedMotion || quality === 'low'

  /* ---- the desk --------------------------------------------------------- */

  const desk = useMemo(() => createDeskGroup(quality), [quality])
  const handle = useMemo(() => getDeskHandle(desk), [desk])

  useEffect(() => () => getDeskHandle(desk)?.dispose(), [desk])

  /* ---- screens ---------------------------------------------------------- */

  /**
   * ONE atlas for both panels — the monitor on top, the laptop below — because the
   * two screen planes are merged into a single mesh reading a single material.
   * `low` and reduced motion get one frame, drawn at build time and never again.
   */
  const screen = useMemo(
    () =>
      createScreenTexture({
        width: 512,
        height: 576,
        fps: instant ? 0 : 12,
        panels: [
          { seed: 3, speed: 1.35 },
          { seed: 19, speed: 0.85 },
        ],
      }),
    [instant],
  )

  useEffect(() => {
    const mat = handle?.screenMaterial
    if (mat) {
      mat.map = screen.texture
      mat.color.set('#FFFFFF')
      mat.needsUpdate = true
    }
    return () => screen.dispose()
  }, [handle, screen])

  /* ---- the plant's growth, shared with the pot's place in the stagger ---- */

  const grow = useMemo<IUniform<number>>(() => ({ value: 1 }), [])
  /** `reveal` in the same 0..1 the desk shader uses; Portrait reads it too. */
  const reveal = useMemo<IUniform<number>>(() => ({ value: 1 }), [])

  /* ---- contact shadow --------------------------------------------------- */

  const shadowTexture = useMemo(() => makeShadowTexture(), [])
  const shadowGeometry = useMemo(() => new CircleGeometry(1, 40), [])
  const shadowMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [shadowTexture],
  )

  useEffect(
    () => () => {
      shadowTexture.dispose()
      shadowGeometry.dispose()
      shadowMaterial.dispose()
    },
    [shadowTexture, shadowGeometry, shadowMaterial],
  )

  /* ---- frame ------------------------------------------------------------ */

  // No renderPriority — a non-zero priority switches R3F to manual rendering and
  // nothing on the page draws at all.
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)

    // `progress` is quantized to 2% steps: fine for a branch, far too coarse for a
    // stagger. Take the live value off the hot path and fall back to the prop when
    // another station owns the scroll.
    const lp =
      scrollState.activeStation === 'about'
        ? scrollState.localProgress
        : clamp((scrollState.progress - RANGE_START) / (RANGE_END - RANGE_START), 0, 1)

    const r = instant ? 1 : remapClamped(lp, BUILD_FROM, BUILD_TO, 0, 1)
    reveal.value = r
    grow.value = saturate((r - 0.25) / 0.42)
    handle?.setReveal(r)

    if (root.current) {
      root.current.rotation.y = lerp(YAW_FROM, YAW_TO, smoothstep(0, 1, lp))
    }

    // The lamp warms as the desk lands, rather than being on before there is a lamp.
    if (lampLight.current) {
      lampLight.current.intensity = lerp(0, quality === 'low' ? 2.6 : 4.2, saturate((r - 0.2) / 0.4))
    }

    screen.update(dt)

    /* ---- post FX -------------------------------------------------------- */

    // Guarded so this station never fights its neighbours for the global stack.
    if (scrollState.activeStation !== 'about') return

    // A calm, light room. The default 0.9 bloom blows the white plastic out.
    postState.bloomIntensity = 0.55
    postState.bloomThreshold = 0.86
    postState.vignette = 0.3

    if (quality === 'high' && handle && root.current) {
      // The look target eases from the monitor toward the portrait across the
      // station — the camera path cannot do that, but the focal plane can, and it
      // is the half of that idea the eye actually reads.
      const a = handle.anchors.monitor
      const b = handle.anchors.portrait
      const k = smoothstep(0.35, 0.9, lp)
      tmp.set(lerp(a.x, b.x, k), lerp(a.y, b.y, k), lerp(a.z, b.z, k))
      root.current.localToWorld(tmp)
      const dist = camera.position.distanceTo(tmp)
      const near = 'near' in camera ? (camera.near as number) : 0.1
      const far = 'far' in camera ? (camera.far as number) : 260
      postState.dofFocusDistance = clamp((dist - near) / (far - near), 0.004, 0.4)
      // Calm. Projects runs 2.2 because glass wants the bokeh; a desk does not.
      postState.dofBokehScale = 1.2
    }
  })

  const plantAt = handle?.anchors.plant
  const portraitAt = handle?.anchors.portrait

  return (
    <group ref={root} name="about-station" position={[0, GROUP_Y, 0]}>
      <primitive object={desk} />

      {/* Fake contact shadow. Elliptical because the camera sits 13–19° above the
          desk for the whole station and a circle reads as a disc, not a shadow. */}
      <mesh
        geometry={shadowGeometry}
        material={shadowMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.74, 0.1]}
        scale={[5.4, 2.7, 1]}
        renderOrder={-1}
      />

      {plantAt ? (
        <Plant
          quality={quality}
          reducedMotion={reducedMotion}
          position={[plantAt.x, plantAt.y, plantAt.z]}
          grow={grow}
        />
      ) : null}

      {portraitAt ? (
        <Portrait
          quality={quality}
          reducedMotion={reducedMotion}
          position={[portraitAt.x, portraitAt.y, portraitAt.z]}
          rotationY={0.4}
          reveal={reveal}
        />
      ) : null}

      {/* Two local lights on top of the global three — inside the six-light
          ceiling in docs/02-ARCHITECTURE.md.

          Portalled out of this group. A light that disappears when the station is
          hidden changes the scene's light count, and three.js rebuilds every
          shader in the scene when that happens. See engine/StationLights.tsx. */}
      <StationLights>
        <pointLight
          ref={lampLight}
          position={[-3.4, 1.42, -0.9]}
          intensity={0}
          distance={7.5}
          decay={2}
          color="#F5A524"
        />
        <pointLight
          position={[4.5, 3.4, 6.5]}
          intensity={quality === 'low' ? 5 : 8}
          distance={28}
          decay={2}
          color="#EAF3FF"
        />
      </StationLights>
    </group>
  )
}
