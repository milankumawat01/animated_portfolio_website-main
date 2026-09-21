'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BackSide,
  CatmullRomCurve3,
  Color,
  ShaderMaterial,
  TubeGeometry,
  UniformsLib,
  UniformsUtils,
  Vector3,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { clamp, lerp } from '@/lib/math'
import { VERTEX_PRELUDE } from '@/lib/shader'
import { scrollState } from '@/store/useScroll'
import pulseVert from './shaders/pulse.vert'
import pulseFrag from './shaders/pulse.frag'

/**
 * 04 EXPERIENCE — "Climbing".
 *
 * A tube of light on a helix that rises 18 units over three turns, authored around
 * the local origin. The camera does the climbing; the geometry stays calm.
 *
 * Two draw calls: a thin solid core and a wide soft sheath on the same curve. The
 * sheath is what survives at distance — at 0.065 world units the core alone is
 * about five pixels across by the time the camera is twenty units out — and it is
 * what carries the halo under the comet head.
 */

// ---------------------------------------------------------------- the path
export const RISE = 18
const TURNS = 3
/**
 * The helix tapers as it rises. Two reasons: it puts the widest part of the
 * silhouette at the foot where the camera is furthest, and the narrowing reads as
 * height all on its own.
 *
 * Both radii are under the bible's 4. The camera closes to eleven units of the
 * axis at the second year marker, and at that range a radius-4 helix spans the
 * whole 1440px frame — it swallowed the DOM's left column whole. 3.5 at the foot
 * keeps the silhouette generous and the overlay legible.
 */
const RADIUS_FOOT = 3.5
const RADIUS_CROWN = 2.4

export const helixRadiusAt = (y: number): number =>
  lerp(RADIUS_FOOT, RADIUS_CROWN, clamp(y / RISE, 0, 1))

/**
 * The camera's local Y at the station's four control points — see `lib/curves`,
 * where experience carries `from` + two mids and hands the fourth to skills. The
 * path is sampled linearly in control index across the station, so a piecewise
 * lerp over these four is a faithful cheap model of the camera's height.
 *
 * Everything that has to agree with "where the camera is right now" — the pulse,
 * the year markers, the DOM card thresholds — goes through this one function.
 */
const CAMERA_Y = [1.1, 5, 12, 19] as const

export const climbHeight = (p: number): number => {
  const t = clamp(p, 0, 1) * 3
  const i = Math.min(Math.floor(t), 2)
  return lerp(CAMERA_Y[i], CAMERA_Y[i + 1], t - i)
}

/**
 * Local progress at which the camera draws level with each year marker. The DOM
 * timeline imports these so a card and its ring cannot drift apart.
 *
 * Order is chronological, bottom to top: the earliest role is at the foot of the
 * helix and the current one at the crown. The station is called "Climbing" and the
 * left rail says "from intern to engineer, with increasing ownership" — running
 * the timeline the other way would have the camera descending through a career.
 *
 * The bible suggests 0.15 / 0.48 / 0.82. These are pulled inward, and measurement
 * is why. Global progress is `scroll / (pageHeight − 100vh)`, not `scroll /
 * pageHeight`, so local progress runs AHEAD of this station's own scroll: local 0
 * happens 40vh before the section's top edge reaches the viewport, and local 1
 * happens at 137vh into a 192vh section. `SectionShell`'s sticky child is
 * therefore pinned from local 0.226 to local 0.746 — a window centred almost
 * exactly on 0.48. Markers at 0.22 / 0.48 / 0.74 put all three arrivals inside
 * it, so all three cards are genuinely centred; 0.15 and 0.82 both land while the
 * overlay is sliding and neither one would be.
 */
export const MARKER_PROGRESS = [0.22, 0.48, 0.74] as const
export const MARKER_HEIGHTS = MARKER_PROGRESS.map(climbHeight)

/** How far in front of the camera the light rides, in world units. */
const PULSE_LEAD = 2.1

const TUBULAR: Record<QualityTier, number> = { low: 80, medium: 160, high: 240 }
const RADIAL: Record<QualityTier, number> = { low: 5, medium: 8, high: 8 }

const CORE_RADIUS = 0.065
const SHEATH_RADIUS = 0.3

/**
 * Linear-space palette. See the header of `shaders/pulse.frag` for why the tube
 * gets brighter in SATURATION rather than in luminance as the climb passes it.
 *
 * PALE is the filament ahead of the light: a quiet grey-blue, present but inert.
 * CHARGED lands on roughly #2788E2 once ACES and sRGB have run — the design
 * system's brand blue, pushed to survive the tone curve. HOT is over 1.0 and is
 * the comet head alone. GLOW is the cyan the halo takes under the comet.
 */
const PALE_COLOR = new Color(0.55, 0.68, 0.88)
const CHARGED_COLOR = new Color(0.05, 0.28, 1.35)
const HOT_COLOR = new Color(3.0, 4.2, 7.0)
const GLOW_COLOR = new Color(0.25, 0.85, 1.5)

export interface HelixProps {
  quality: QualityTier
  reducedMotion: boolean
  progress: number
}

export function Helix({ quality, reducedMotion, progress }: HelixProps) {
  const low = quality === 'low'
  const animated = !low && !reducedMotion

  const curve = useMemo(() => {
    const points: Vector3[] = []
    const samples = 96
    for (let i = 0; i <= samples; i++) {
      const t = i / samples
      const y = t * RISE
      const a = t * TURNS * Math.PI * 2
      const r = helixRadiusAt(y)
      points.push(new Vector3(Math.cos(a) * r, y, Math.sin(a) * r))
    }
    return new CatmullRomCurve3(points, false, 'catmullrom', 0.5)
  }, [])

  const built = useMemo(() => {
    const tubular = TUBULAR[quality]
    const radial = RADIAL[quality]

    const coreGeo = new TubeGeometry(curve, tubular, CORE_RADIUS, radial, false)
    const sheathGeo = new TubeGeometry(curve, tubular, SHEATH_RADIUS, radial + 2, false)

    const uniforms = () => ({
      ...UniformsUtils.clone(UniformsLib.fog),
      uFill: { value: 0 },
      uPulse: { value: 0 },
      uPulseOn: { value: animated ? 1 : 0 },
      uTime: { value: 0 },
      uFade: { value: 0 },
      uPale: { value: PALE_COLOR },
      uCharged: { value: CHARGED_COLOR },
      uHot: { value: HOT_COLOR },
      uGlow: { value: GLOW_COLOR },
    })

    const vertexShader = `${VERTEX_PRELUDE}\n${pulseVert}`

    const coreMat = new ShaderMaterial({
      vertexShader,
      fragmentShader: pulseFrag,
      uniforms: uniforms(),
      fog: true,
      transparent: true,
      depthWrite: true,
    })

    const sheathMat = new ShaderMaterial({
      vertexShader,
      fragmentShader: pulseFrag,
      defines: { SHEATH: '' },
      uniforms: uniforms(),
      fog: true,
      transparent: true,
      depthWrite: false,
      side: BackSide,
    })

    return { coreGeo, sheathGeo, coreMat, sheathMat }
  }, [curve, quality, animated])

  useEffect(
    () => () => {
      built.coreGeo.dispose()
      built.sheathGeo.dispose()
      built.coreMat.dispose()
      built.sheathMat.dispose()
    },
    [built],
  )

  const state = useRef({ time: 0, fade: 0 })

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const s = state.current

    // The `progress` prop is quantized to 2% steps, which on an 18-unit climb is a
    // 36cm jump every frame it changes — the pulse would visibly stair-step. Read
    // the hot path instead, and fall back to the prop while the station is mounted
    // inside its padding but is not the active one.
    const p =
      scrollState.activeStation === 'experience' ? scrollState.localProgress : progress

    const y = climbHeight(p)
    const fill = clamp(y / RISE, 0, 1.2)
    const pulse = clamp((y + PULSE_LEAD) / RISE, 0, 1.25)

    if (animated) s.time += dt
    // Snap in rather than damp: the fade is keyed to progress, and damping a
    // scroll-bound value makes it lag the camera on a fast flick.
    s.fade = clamp((p - 0.015) / 0.1, 0, 1)

    for (const mat of [built.coreMat, built.sheathMat]) {
      mat.uniforms.uFill.value = fill
      mat.uniforms.uPulse.value = pulse
      mat.uniforms.uTime.value = s.time
      mat.uniforms.uFade.value = s.fade
    }
  })

  return (
    <group name="experience-helix">
      {/* Both passes are transparent, so depth sorting alone would let the halo
          paint over the filament it is meant to sit behind. renderOrder settles
          it once instead of every frame. */}
      <mesh
        geometry={built.sheathGeo}
        material={built.sheathMat}
        renderOrder={-2}
        frustumCulled={false}
      />
      <mesh geometry={built.coreGeo} material={built.coreMat} frustumCulled={false} />
    </group>
  )
}
