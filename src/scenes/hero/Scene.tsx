'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  Color,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from 'three'
import type { QualityTier, SceneProps } from '@/engine/types'
import { postState } from '@/engine/PostFX'
import { scrollState } from '@/store/useScroll'
import { useInteraction } from '@/store/useInteraction'
import { glsl } from '@/lib/shader'
import { clamp, hash11, remapClamped } from '@/lib/math'
import { MonogramPoints } from './MonogramPoints'
import { FogVolume } from './FogVolume'

/**
 * 01 — HERO · "the idea, before it has a shape"
 *
 * A particle field settled into the MK monogram that frays apart left-to-right as
 * you scroll, inside a barely-there fog volume, with a few haze cards drifting past
 * the camera for parallax. Everything is authored around local (0,0,0);
 * `SceneDirector` puts the group at the station anchor.
 *
 * Three draw calls at `high`: points, fog, dust.
 */

const PARTICLES: Record<QualityTier, number> = {
  low: 8_000,
  medium: 40_000,
  high: 150_000,
}

const DUST: Record<QualityTier, number> = { low: 0, medium: 2, high: 4 }

/** World size of the mark's longest axis. Fits the z=4 frame with margin to spare. */
const MONOGRAM_SCALE = 3.1

/**
 * The mark leans right of the station origin so it clears the DOM headline, which
 * sits in the left column. `MonogramPoints` itself stays centred on its own origin
 * — the offset is the scene's business, not the component's, because Contact
 * reuses the component with a different composition.
 */
/**
 * Sized and placed to the frame at p=0, which is the tightest it ever gets: the
 * camera starts 4 units out at 62° fov, so only x -2.4..2.4 is on screen, and the
 * headline column owns everything left of x ≈ -0.2. A 4.9-scale mark at x 1.15
 * spanned -1.3..3.6 — it sat on top of 'Milan Kumawat' AND ran off the right
 * edge. This spans roughly -0.05..3.1: clear of the headline, and the camera
 * pulls back to z=13 almost immediately so the right edge is only briefly tight.
 */
const MONOGRAM_OFFSET: [number, number, number] = [1.52, 0.35, 0]

/** brand-400 — docs/01-DESIGN-SYSTEM.md §1. */
const PARTICLE_COLOR = '#3B82F6'
/** The brand ramp, for the Konami pulse. */
const EGG_COLORS = ['#3B82F6', '#2563EB', '#1D4ED8', '#F5A524', '#16A34A'] as const

/** Local progress over which the mark comes apart. */
const DISSOLVE_IN = 0.04
const DISSOLVE_OUT = 0.78

/** Camera far plane, from CameraRig. DOF focus is normalised against it. */
const CAMERA_FAR = 260

/** Extra CA on top of the global velocity term. */
const CA_GAIN = 0.0011

// Hoisted — useFrame must not allocate.
const worldPos = new Vector3()
const dummy = new Object3D()

// --------------------------------------------------------------------- dust

const dustVertex = glsl`
attribute vec3 aMote;
varying vec2 vUv;
varying float vAlpha;

void main() {
  vUv = uv;
  vAlpha = aMote.z;
  // Billboard in view space: cheaper and steadier than re-orienting on the CPU.
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += position.xy * aMote.y;
  gl_Position = projectionMatrix * mv;
}
`

const dustFragment = glsl`
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
varying float vAlpha;

void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(1.0 - smoothstep(0.0, 1.0, d), 2.4);
  if (a <= 0.002) discard;
  gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

/**
 * The parallax layer: a handful of soft haze cards strung along the camera's pull
 * back, so something passes close to the lens while the monogram recedes. One
 * `InstancedMesh`, one draw call, two triangles each.
 */
function DustMotes({ count, idle }: { count: number; idle: boolean }) {
  const mesh = useRef<InstancedMesh>(null)

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(1, 1)
    const motes = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      motes[i * 3] = hash11(i * 3.3 + 0.7)
      motes[i * 3 + 1] = 2.6 + hash11(i * 9.1 + 4.4) * 4.2
      motes[i * 3 + 2] = 0.25 + hash11(i * 6.7 + 12.2) * 0.5
    }
    g.setAttribute('aMote', new InstancedBufferAttribute(motes, 3))
    return g
  }, [count])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        uniforms: {
          uColor: { value: new Color('#6E9BE8') },
          uOpacity: { value: 0.07 },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        fog: false,
      }),
    [],
  )

  const home = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (hash11(i * 1.7 + 5.5) - 0.5) * 7,
        y: (hash11(i * 4.9 + 2.2) - 0.5) * 4.4,
        z: 1.6 + hash11(i * 8.3 + 7.7) * 10,
        phase: hash11(i * 2.9 + 19.4) * Math.PI * 2,
      })),
    [count],
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  const t = useRef(0)
  useFrame((_, rawDelta) => {
    const m = mesh.current
    if (!m) return
    if (idle) t.current += Math.min(rawDelta, 0.1)

    for (let i = 0; i < count; i++) {
      const h = home[i]
      dummy.position.set(
        h.x + Math.sin(t.current * 0.11 + h.phase) * 0.6,
        h.y + Math.cos(t.current * 0.09 + h.phase * 1.7) * 0.45,
        h.z,
      )
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      name="hero-dust"
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  )
}

// -------------------------------------------------------------------- scene

export function HeroScene({ progress, active, quality, reducedMotion }: SceneProps) {
  const group = useRef<Group>(null)

  /**
   * `progress` arrives in ~2% steps, which is plenty for choosing the dissolve
   * target — `MonogramPoints` damps toward it, so the steps never reach the screen.
   */
  const dissolve = remapClamped(progress, DISSOLVE_IN, DISSOLVE_OUT, 0, 1)

  useFrame((state) => {
    // Only the active station dials the shared post stack, or two mounted stations
    // would fight over it across a boundary.
    if (!active) return

    // docs/03-SCENE-BIBLE.md § 01: bloom 0.9 / threshold 0.75.
    postState.bloomIntensity = 0.9
    postState.bloomThreshold = 0.75
    postState.vignette = 0.46

    // PostFX already smears CA by |velocity| globally; this is hero's extra helping
    // on top, because this station is the one that sells the trick.
    postState.chromaticAberration = reducedMotion
      ? 0
      : Math.abs(scrollState.velocity) * CA_GAIN

    // Keep the cloud in focus as the camera pulls back from 4 to 13 units. Measured
    // from the group's world position, so this holds wherever the anchor sits.
    if (group.current) {
      group.current.getWorldPosition(worldPos)
      const d = state.camera.position.distanceTo(worldPos)
      postState.dofFocusDistance = clamp(d / CAMERA_FAR, 0.004, 0.2)
      postState.dofBokehScale = 1.6
    }
  })

  const dustCount = DUST[quality]

  /**
   * Konami. Cycles the cloud through the brand ramp for three seconds, wherever
   * you are on the page. A subscription is fine here — it changes twice, ever.
   */
  const easterEgg = useInteraction((s) => s.easterEgg)
  const [eggStep, setEggStep] = useState(0)
  useEffect(() => {
    if (!easterEgg) return
    const id = window.setInterval(() => setEggStep((n) => n + 1), 260)
    return () => window.clearInterval(id)
  }, [easterEgg])
  const particleColor = easterEgg
    ? EGG_COLORS[eggStep % EGG_COLORS.length]
    : PARTICLE_COLOR

  return (
    <group ref={group} name="hero">
      <group position={MONOGRAM_OFFSET}>
        <MonogramPoints
          count={PARTICLES[quality]}
          dissolve={dissolve}
          scale={MONOGRAM_SCALE}
          color={particleColor}
          spread={quality === 'low' ? 1.6 : 1.9}
          idle={!reducedMotion}
        />
      </group>

      {quality !== 'low' ? (
        <FogVolume radius={24} color="#1D4ED8" opacity={0.08} idle={!reducedMotion} />
      ) : null}

      {dustCount > 0 ? <DustMotes count={dustCount} idle={!reducedMotion} /> : null}
    </group>
  )
}
