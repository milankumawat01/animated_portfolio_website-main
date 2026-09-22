'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  Color,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  type Group,
} from 'three'
import type { QualityTier, SceneProps } from '@/engine/types'
import { postState, focusAtDistance } from '@/engine/PostFX'
import { scrollState } from '@/store/useScroll'
import { glsl } from '@/lib/shader'
import { lerp, remapClamped, smoothstep } from '@/lib/math'
// ---------------------------------------------------------------------------
// THE TWO CROSS-STATION IMPORTS. Both are shipped exports of other stations and
// neither is reimplemented here — a duplicated desk is worse than a stub, and a
// second particle system would be a second copy of the hero to keep in sync.
import { MonogramPoints } from '@/scenes/hero/MonogramPoints'
import { createDeskGroup, getDeskHandle } from '@/scenes/about/desk'
// ---------------------------------------------------------------------------
import { LampCone } from './LampCone'
import { GlassPanels } from './GlassPanels'
import { StationLights } from '@/engine/StationLights'

/**
 * 08 — CONTACT · "Back to the room"
 *
 * The bookend. The camera has pulled all the way back and the About desk is over
 * there in the dark, small, under one warm lamp — you are looking at where you
 * started, from outside the room. The hero's particles drift back in off to the
 * side and reassemble the monogram, then hold. Then the footer.
 *
 * WHERE THINGS ARE. Local space, anchor `[0, 0, -300]`. The camera runs
 * `(-7, 3.2, 56)` → `(-2, 2.5, 18)` → `(0.5, 2, 12)` → `(0.5, 1.7, 11.4)`, and the
 * last two are nearly the same point: the final fifth of the station has almost no
 * camera motion, by design, so the footer reads as solid ground rather than
 * something still moving under you. Everything is composed for a subject 11–18
 * units out, in the RIGHT half of frame, because the DOM overlay owns the left.
 *
 * THE REFORM. `MonogramPoints` is deliberately free of scroll state — the parent
 * hands it `dissolve`. So Contact hands it `1 → 0` over `p 0.12 … 0.62` and the
 * hero's dissolve runs backwards. It is settled well before the footer is on
 * screen, which matters: the footer only becomes readable around `p ≈ 0.6`, when
 * the sticky panel finishes pinning.
 *
 * DRAW CALLS. backdrop 1 + floor pool 1 + lamp cone 1 + desk 4 + monogram 1 +
 * glass panels 1 (instanced) = 9 at `high`, against a budget of 20.
 */

/* -------------------------------------------------------------------------- */
/* Composition constants                                                       */
/* -------------------------------------------------------------------------- */

/** The desk, three-quarter on, small and off in the dark to the right. */
const DESK_POSITION: [number, number, number] = [3.6, -1.35, -7]
const DESK_SCALE = 0.4
const DESK_YAW = 0.44

/**
 * Where the warm shaft comes from. The tip sits just inside the top of frame at
 * rest: pushed any higher the taper leaves the viewport and the shaft stops
 * reading as a cone at all — it becomes a vertical smear. A small bulb glow at the
 * tip is what stops an apex hanging in mid-air from looking like a bug.
 */
const LAMP_TIP: [number, number, number] = [3.3, 6.4, -6.6]
const LAMP_HEIGHT = 8.4
/** Floor height: the underside of the scaled desk's legs. Everything lands here. */
const FLOOR_Y = DESK_POSITION[1] - 1.69 * DESK_SCALE

/** The mark, small and off to the side, upper right. */
const MONOGRAM_POSITION: [number, number, number] = [3.15, 2.45, 1.8]
const MONOGRAM_SCALE = 2.4
/** brand-400 — the same colour it dissolved from in the hero. */
const MONOGRAM_COLOR = '#3B82F6'

/**
 * 30% of the hero's counts, as the scene bible asks. `low` has none at all: the
 * tier table says the closing station is the lamp cone and a dark gradient there.
 */
const PARTICLES: Record<QualityTier, number> = { low: 0, medium: 8_000, high: 45_000 }

/**
 * `MonogramPoints` compensates for count on its own — fewer points get a bigger
 * sprite and a higher alpha so the mark keeps the same total exposure. Calibrated
 * against the hero, where the cloud is 4.9 units wide and fills the frame. Here it
 * is 2.4 units wide and sits inside a warm lamp shaft, so the 8k version came out
 * visibly hotter and coarser than the 45k one and bloomed over the floating card.
 * These pull the medium tier back to roughly the same read as high.
 */
const POINT_SIZE: Record<QualityTier, number> = { low: 1.8, medium: 0.95, high: 1.8 }
const POINT_ALPHA: Record<QualityTier, number | undefined> = {
  low: undefined,
  medium: 0.5,
  high: undefined,
}

/** The reform window. Complete by 0.62 so it is settled long before the footer. */
const REFORM_IN = 0.12
const REFORM_OUT = 0.62

/**
 * Behind the DOM contact tiles. These numbers are not a guess: they are the tile
 * grid's measured screen rectangle at 1440 × 900, unprojected onto z = 0.9 for the
 * resting camera `(0.5, 1.7, 11.4)` at fov 42. The tile block centres on
 * `(-0.40, +0.21)` in NDC, and at that plane the half-frame is 6.48 × 4.05 units.
 * A 2 × 2 of 3.3 × 0.7 panes on a 3.30 × 0.74 pitch lands one pane just proud of
 * each card. Change the DOM grid and these have to move with it.
 */
const PANEL_CENTER: [number, number, number] = [-2.59, 1.2, 0.9]

/* -------------------------------------------------------------------------- */
/* A soft glow plane — the dark gradient, and the pool the lamp lands in        */
/* -------------------------------------------------------------------------- */

const glowVertex = glsl`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const glowFragment = glsl`
uniform vec3  uColor;
uniform float uIntensity;
uniform float uFalloff;
uniform vec2  uStretch;

varying vec2 vUv;

void main() {
  vec2 d = (vUv - 0.5) * 2.0 * uStretch;
  float a = pow(clamp(1.0 - length(d), 0.0, 1.0), uFalloff) * uIntensity;
  if (a <= 0.0025) discard;
  gl_FragColor = vec4(uColor, a);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

interface GlowPlaneProps {
  width: number
  height: number
  color: string
  intensity: number
  falloff: number
  /** >1 tightens that axis; the floor pool is an ellipse, not a circle */
  stretch?: [number, number]
  position: [number, number, number]
  rotation?: [number, number, number]
  name: string
}

/**
 * One additive radial wash on a quad. Two of these carry the whole "room": a wall
 * of dim light behind the desk so the background is a gradient rather than a flat
 * fill, and an elliptical pool on the floor so the lamp cone lands on something.
 * Both survive at `low` — the tier table names "the lamp cone and a dark gradient"
 * as exactly what has to be there.
 */
function GlowPlane({
  width,
  height,
  color,
  intensity,
  falloff,
  stretch = [1, 1],
  position,
  rotation,
  name,
}: GlowPlaneProps) {
  const geometry = useMemo(() => new PlaneGeometry(width, height), [width, height])
  const [sx, sy] = stretch

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        uniforms: {
          uColor: { value: new Color(color) },
          uIntensity: { value: intensity },
          uFalloff: { value: falloff },
          uStretch: { value: [sx, sy] },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        fog: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    ;(material.uniforms.uColor.value as Color).set(color)
    material.uniforms.uIntensity.value = intensity
    material.uniforms.uFalloff.value = falloff
    ;(material.uniforms.uStretch.value as number[])[0] = sx
    ;(material.uniforms.uStretch.value as number[])[1] = sy
  }, [material, color, intensity, falloff, sx, sy])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh
      name={name}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      renderOrder={-1}
      frustumCulled={false}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* The distant desk                                                            */
/* -------------------------------------------------------------------------- */

/**
 * `createDeskGroup('low')` REGARDLESS OF TIER. At this distance the desk is about
 * 15% of the frame's width; the rounded-corner segments and the extra cylinder
 * sides of the higher variants are sub-pixel, so the saving is free.
 *
 * Four meshes, four draw calls, already fully assembled (`uReveal` defaults to 1 —
 * About drives that API, Contact does not have to know it exists). The screens are
 * left without a map on purpose: two switched-off panels is the correct look for a
 * desk nobody is sitting at.
 */
function DistantDesk({ position, scale, yaw }: {
  position: [number, number, number]
  scale: number
  yaw: number
}) {
  const desk = useMemo(() => {
    const g = createDeskGroup('low')
    /**
     * Knock the albedos back. The desk was authored for a lit, light station with
     * the camera 14 units out; here it is 19 units out in the dark with one warm
     * lamp on it, and the stock plastic (#E6EDF8) blows straight through the
     * bloom threshold. These are this instance's own materials, not the module's.
     */
    g.traverse((o) => {
      if (o instanceof Mesh && o.material instanceof MeshStandardMaterial) {
        o.material.color.multiplyScalar(0.42)
      }
    })
    return g
  }, [])

  useEffect(() => () => getDeskHandle(desk)?.dispose(), [desk])

  return (
    <primitive object={desk} position={position} scale={scale} rotation={[0, yaw, 0]} />
  )
}

/* -------------------------------------------------------------------------- */
/* Scene                                                                       */
/* -------------------------------------------------------------------------- */

// Hoisted — useFrame must not allocate.
const worldPos = new Vector3()
const subject = new Vector3()

const [RANGE_START, RANGE_END] = [0.91, 1.0]

export function ContactScene({ progress, active, quality, reducedMotion }: SceneProps) {
  const camera = useThree((s) => s.camera)
  const low = quality === 'low'
  const root = useRef<Group>(null)

  /**
   * The hero's dissolve, run backwards. `progress` is quantized to ~2% steps, which
   * is fine here: `MonogramPoints` damps `dissolve` internally so the steps never
   * reach the screen. Under reduced motion the mark is simply already there.
   */
  const dissolve = reducedMotion ? 0 : 1 - remapClamped(progress, REFORM_IN, REFORM_OUT, 0, 1)

  const particles = PARTICLES[quality]

  useFrame(() => {
    // Only the active station writes the shared post stack, or two mounted
    // stations fight over it across the Writing boundary.
    if (!active || scrollState.activeStation !== 'contact') return

    const p = remapClamped(scrollState.progress, RANGE_START, RANGE_END, 0, 1)

    /**
     * This is the one station that can afford real bloom. Everything bright here —
     * the shaft, the pool, the reforming mark — is additive light on near-black, so
     * raising the intensity and dropping the threshold picks up the glow and
     * nothing else. The light stations cannot do this: a #F5F8FC background is
     * already over any usable threshold.
     */
    postState.bloomIntensity = lerp(1.05, 1.45, smoothstep(0.2, 0.75, p))
    postState.bloomThreshold = 0.6
    postState.vignette = 0.52
    postState.chromaticAberration = 0

    /**
     * Focus walks from the desk to the monogram as the mark reforms, then holds
     * with the camera. `focusAtDistance` rather than a raw number — the old
     * hardcoded 0.02 focused at about five units and turned every station to mush.
     * Bokeh at 1.5: two other stations found the 2.2 default too strong.
     */
    if (!root.current) return
    root.current.getWorldPosition(worldPos)
    const t = smoothstep(0.2, 0.6, p)
    subject.set(
      lerp(DESK_POSITION[0], MONOGRAM_POSITION[0], t),
      lerp(DESK_POSITION[1] + 1, MONOGRAM_POSITION[1], t),
      lerp(DESK_POSITION[2], MONOGRAM_POSITION[2], t),
    )
    subject.add(worldPos)
    postState.dofFocusDistance = focusAtDistance(camera.position.distanceTo(subject))
    postState.dofBokehScale = 1.5
  })

  return (
    <group ref={root} name="contact-station">
      {/* Two local lights on top of the global three, well inside the six ceiling.
          Portalled out of this group so the scene's light count stays constant
          whether or not this station is visible — see engine/StationLights.tsx. */}
      <StationLights>
        {/* The key: the bulb at the top of the shaft. The global warm lamp sits at
            the hero's anchor 300 units away, so this station has to bring its own. */}
        <pointLight
          position={[LAMP_TIP[0], LAMP_TIP[1] - LAMP_HEIGHT * 0.55, LAMP_TIP[2]]}
          intensity={low ? 34 : 58}
          distance={24}
          decay={2}
          color="#F5A524"
        />
        {/* A cold counter-fill from the camera side, so the desk has an edge and the
            right-hand bleed is not a black hole. */}
        <pointLight
          position={[1.5, 3.2, 7]}
          intensity={14}
          distance={34}
          decay={2}
          color="#3B82F6"
        />
      </StationLights>

      {/* The dark gradient. Present at every tier. */}
      <GlowPlane
        name="contact-backdrop"
        width={80}
        height={46}
        color="#14233D"
        intensity={0.42}
        falloff={2.4}
        stretch={[1.0, 1.35]}
        position={[2.0, 1.5, -24]}
      />

      {/* The pool the shaft lands in — this is what makes the floor exist. */}
      <GlowPlane
        name="contact-floor-pool"
        width={20}
        height={20}
        color="#C8802A"
        intensity={low ? 0.62 : 0.5}
        falloff={2.8}
        stretch={[1.0, 1.15]}
        position={[LAMP_TIP[0], FLOOR_Y + 0.01, LAMP_TIP[2] + 0.4]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* The bulb, so the tip of the shaft has a source. */}
      <GlowPlane
        name="contact-bulb"
        width={1.8}
        height={1.8}
        color="#FFD9A0"
        intensity={low ? 0.85 : 0.5}
        falloff={2.2}
        position={[LAMP_TIP[0], LAMP_TIP[1] - 0.1, LAMP_TIP[2] + 0.05]}
      />

      <LampCone
        height={LAMP_HEIGHT}
        topRadius={0.35}
        bottomRadius={3.0}
        position={LAMP_TIP}
        opacity={low ? 0.55 : 0.4}
        idle={!reducedMotion}
        dust={low ? 0 : 0.55}
        segments={low ? 16 : 24}
      />

      {/* Where you started, seen from outside. Off at `low`, per the tier table. */}
      {!low ? (
        <DistantDesk position={DESK_POSITION} scale={DESK_SCALE} yaw={DESK_YAW} />
      ) : null}

      {particles > 0 ? (
        <group position={MONOGRAM_POSITION}>
          <MonogramPoints
            count={particles}
            dissolve={dissolve}
            scale={MONOGRAM_SCALE}
            color={MONOGRAM_COLOR}
            spread={2.6}
            size={POINT_SIZE[quality]}
            opacity={POINT_ALPHA[quality]}
            idle={!reducedMotion}
          />
        </group>
      ) : null}

      {/**
       * The panes fade up with the station rather than being there from the
       * start. They are an echo of the DOM tiles, and the tiles are still below
       * the fold for the first half of this station — four slabs hanging in empty
       * space on the approach read as debris, not as an echo.
       */}
      <GlassPanels
        center={PANEL_CENTER}
        quality={quality}
        idle={!reducedMotion}
        opacity={0.5 * smoothstep(0.28, 0.66, progress)}
      />
    </group>
  )
}
