'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Sphere,
  Vector3,
} from 'three'
import { COMMON, CURL_NOISE, SIMPLEX_3D } from '@/lib/shader'
import { clamp, damp, hash11 } from '@/lib/math'
import { sampleMonogram } from './lib/sampleMonogram'
import vertexShader from './shaders/points.vert'
import fragmentShader from './shaders/points.frag'

/**
 * THE HERO SET PIECE — and a reusable one.
 *
 * One `THREE.Points`, one draw call, whatever the count. Each particle carries a
 * free position (`position`) and a monogram position (`aTarget`); the vertex shader
 * mixes between them by `uDissolve` plus a per-particle offset, so the mark frays
 * apart from the left rather than wiping.
 *
 * It deliberately knows nothing about scroll. The parent owns `dissolve`, which is
 * what lets Contact mount the same component and run it from 1 → 0 to reassemble the
 * mark at the end of the page.
 *
 *   <MonogramPoints count={150000} dissolve={0.4} scale={6} color="#3B82F6" />
 *
 * `dissolve` is damped internally, because the value a station has to hand comes
 * from the quantized `progress` prop and would otherwise arrive in visible steps.
 */

export interface MonogramPointsProps {
  /** particle count — drive this from the quality tier */
  count: number
  /** 0 = settled into the monogram, 1 = fully dispersed */
  dissolve: number
  /** world size of the mark's longest axis */
  scale: number
  /** base particle colour, any CSS/hex string three accepts */
  color: string
  /** radius of the dispersed cloud, as a multiple of `scale` */
  spread?: number
  /**
   * Overall alpha. Leave it out: the default compensates for count, because
   * additive brightness is a function of how many sprites stack on a pixel.
   */
  opacity?: number
  /** false under reduced motion: the dissolve still tracks, the idle drift stops */
  idle?: boolean
  /** base point size in px at 1 unit of distance, before count compensation */
  size?: number
}

/** Particle count at which `size` and the default alpha are calibrated. */
const REFERENCE_COUNT = 150_000

/** Alpha at REFERENCE_COUNT. Everything else is scaled off this. */
const REFERENCE_ALPHA = 0.22

/**
 * Exposure is (alpha × overlapping sprites), and overlap scales with count, so the
 * per-point alpha has to come back down as the cloud gets denser. Measured against
 * the three tiers: 150k → 0.22, 40k → 0.41, 8k → 0.85.
 */
const alphaForCount = (count: number): number =>
  clamp(REFERENCE_ALPHA * Math.pow(REFERENCE_COUNT / Math.max(count, 1), 0.47), 0.14, 0.85)

/** How the dissolve catches up to the prop. Higher is snappier. */
const DISSOLVE_LAMBDA = 5.5

const hotColor = new Color('#FFFFFF')

/** Free positions: a slightly flattened ball, denser toward the middle. */
const freeCloud = (count: number): Float32Array => {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // Deterministic, so a remount does not reshuffle the cloud mid-scroll.
    const u = hash11(i * 1.13 + 3.7)
    const v = hash11(i * 2.71 + 11.3)
    const w = hash11(i * 0.37 + 29.1)

    const theta = u * Math.PI * 2
    const phi = Math.acos(2 * v - 1)
    const r = 0.30 + 0.70 * Math.cbrt(w)

    const o = i * 3
    out[o] = r * Math.sin(phi) * Math.cos(theta)
    out[o + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72
    out[o + 2] = r * Math.cos(phi)
  }
  return out
}

export function MonogramPoints({
  count,
  dissolve,
  scale,
  color,
  spread = 1.9,
  opacity,
  idle = true,
  size = 1.8,
}: MonogramPointsProps) {
  const gl = useThree((s) => s.gl)

  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    const free = freeCloud(count)

    // Targets start as a compressed copy of the free cloud so there is valid
    // geometry on frame one; the real monogram is written in as soon as it lands.
    const target = new Float32Array(count * 3)
    for (let i = 0; i < target.length; i++) target[i] = free[i] * 0.34

    const seed = new Float32Array(count)
    const pscale = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      seed[i] = hash11(i * 5.17 + 1.9)
      const s = hash11(i * 7.31 + 41.7)
      pscale[i] = 0.42 + s * s * 1.05
    }

    g.setAttribute('position', new BufferAttribute(free, 3))
    g.setAttribute('aTarget', new BufferAttribute(target, 3))
    g.setAttribute('aSeed', new BufferAttribute(seed, 1))
    g.setAttribute('aScale', new BufferAttribute(pscale, 1))
    // Hand-set: the shader displaces well outside the attribute bounds, and
    // recomputing from `position` would cull the cloud the moment it disperses.
    g.boundingSphere = new Sphere(new Vector3(0, 0, 0), 8)
    return g
  }, [count])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        // NOT `SHADER_PRELUDE`: it bundles `aaLine`, which calls `fwidth`, and
        // derivatives are fragment-only in GLSL ES 1.0 — the vertex stage fails to
        // compile. Each stage gets exactly the chunks it needs. See the report.
        vertexShader: `${SIMPLEX_3D}\n${CURL_NOISE}\n${vertexShader}`,
        fragmentShader: `${COMMON}\n${fragmentShader}`,
        uniforms: {
          uTime: { value: 0 },
          uDissolve: { value: 0 },
          uScale: { value: scale },
          uSize: { value: size },
          uPixelRatio: { value: 1 },
          uIdle: { value: idle ? 1 : 0 },
          uSpread: { value: spread },
          uColor: { value: new Color(color) },
          uHot: { value: hotColor },
          uOpacity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: AdditiveBlending,
      }),
    // Everything else is written through uniforms every frame; only the shader
    // source would warrant a rebuild, and that never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  // --- load the monogram --------------------------------------------------
  const loaded = useRef(false)
  useEffect(() => {
    let cancelled = false
    loaded.current = false
    sampleMonogram(count)
      .then((targets) => {
        if (cancelled) return
        const attr = geometry.getAttribute('aTarget') as BufferAttribute
        ;(attr.array as Float32Array).set(targets)
        attr.needsUpdate = true
        loaded.current = true
      })
      .catch(() => {
        // sampleMonogram already falls back internally; this is belt and braces.
        loaded.current = true
      })
    return () => {
      cancelled = true
    }
  }, [count, geometry])

  // --- per-frame ------------------------------------------------------------
  const target = useRef(dissolve)
  target.current = dissolve

  // Denser clouds need smaller points to hit the same apparent density.
  const sizeForCount = useMemo(
    () => size * Math.pow(REFERENCE_COUNT / Math.max(count, 1), 0.35),
    [size, count],
  )
  const alpha = opacity ?? alphaForCount(count)

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const u = material.uniforms

    if (idle) u.uTime.value += dt
    u.uIdle.value = damp(u.uIdle.value as number, idle ? 1 : 0, 4, dt)
    u.uDissolve.value = damp(u.uDissolve.value as number, target.current, DISSOLVE_LAMBDA, dt)
    u.uScale.value = scale
    u.uSpread.value = spread
    u.uSize.value = sizeForCount
    u.uPixelRatio.value = gl.getPixelRatio()
    // Fade in once the mark exists, so the placeholder ball is never on screen.
    u.uOpacity.value = damp(u.uOpacity.value as number, loaded.current ? alpha : 0, 3.5, dt)
  })

  useEffect(() => {
    ;(material.uniforms.uColor.value as Color).set(color)
  }, [material, color])

  return (
    <points
      name="monogram-points"
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  )
}
