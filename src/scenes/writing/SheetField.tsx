'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  InstancedBufferAttribute,
  Object3D,
  PlaneGeometry,
  type InstancedMesh,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { hash11 } from '@/lib/math'
import {
  D_NEAR,
  D_FAR,
  MIN_RADIUS,
  SHEET_H,
  SHEET_W,
  aimSheet,
  makePaperMaterial,
  wrapD,
  type FieldDrive,
} from './Sheet'

/**
 * 07 — WRITING · the blank field.
 *
 * Fourteen unprinted sheets, ONE InstancedMesh, ONE draw call. They are the
 * station's weather: the four featured pages are the only things you are meant to
 * read, and these are what make the air they fall through look occupied.
 *
 * They carry the same `curl.vert` as the featured sheets — three.js defines
 * `USE_INSTANCING` on its own when a material is bound to an InstancedMesh, so the
 * shader picks up `aPhase`/`aSeed`/`aAmp` instead of the uniforms without the
 * source having to be duplicated.
 *
 * Roughly one in three spawns with a half-turn of yaw baked in, so their reverse is
 * what faces the lens. That is deliberate: the back-face tint only proves itself if
 * something is actually showing its back at any given moment, and a slow tumble
 * alone would not guarantee it inside the seconds a visitor spends here.
 *
 * SEGMENTS: 16 x 10, against 24 x 16 for the featured sheets. The curl has no
 * wavelength shorter than the sheet, so ten spans across the fold resolves it; the
 * featured ones only carry more because a printed page turning near the lens is
 * the thing you actually look at.
 */

const MAX_BLANKS = 14

const COUNT_BY_TIER: Record<QualityTier, number> = {
  low: 0,
  medium: 8,
  high: MAX_BLANKS,
}

interface Blank {
  x: number
  y: number
  d: number
  /** where it parks when travel is switched off — reduced motion */
  dStill: number
  scale: number
  /** true when the sheet spawns reversed, showing its tinted back */
  flipped: boolean
  spin: number
  phase: number
}

/**
 * Deterministic, so the field is identical between the server, the client and
 * every probe run. Radius is biased small — a sheet at 12 units off the axis is
 * only in frame while it is a long way out.
 */
/** The largest per-frame wander added to a blank's resting offset. */
const MAX_DRIFT = 0.85

const BLANKS: readonly Blank[] = Array.from({ length: MAX_BLANKS }, (_, i) => {
  const s = i * 5.13 + 1.7
  const angle = hash11(s) * Math.PI * 2
  const radius = MIN_RADIUS + 0.6 + Math.pow(hash11(s + 11), 1.7) * 8.4
  let x = Math.cos(angle) * radius
  // Squeezed against X because the frame is 16:9, then lifted: the DOM overlay
  // owns the middle and lower thirds of the screen for most of this station, and
  // the scene bible asks for the camera to be watching pages RISE.
  let y = Math.sin(angle) * radius * 0.62 + 0.9

  /**
   * Re-apply the floor to the FINAL offset, not to the radius it came from. The
   * 0.62 squeeze and the +0.9 lift can between them drop a sheet that started at
   * 2.6 units out to 0.7 — which is inside its own half-diagonal, so it would
   * have swept straight through the lens on its way past. Found by arithmetic
   * rather than by seeing it, because it only happens to a sheet whose spawn
   * angle lands near the bottom of the circle.
   */
  const floor = MIN_RADIUS + MAX_DRIFT
  const r = Math.hypot(x, y)
  if (r < 1e-3) {
    x = floor
    y = 0
  } else if (r < floor) {
    x *= floor / r
    y *= floor / r
  }

  // Spread down the corridor with a jitter, so the stream never pulses.
  const slice = (D_FAR - D_NEAR) / MAX_BLANKS
  return {
    x,
    y,
    d: D_NEAR + slice * (i + 0.25 + hash11(s + 23) * 0.5),
    // Frozen, the travelling spread is wrong: it starts at the lens plane, so
    // whichever sheet happens to be at the near end is parked on top of the
    // camera forever. This folds the same field into the 5–36 unit band, where a
    // sheet that is never going to move still reads as a sheet.
    dStill: 5.5 + (i % 7) * 4.6 + hash11(s + 29) * 3,
    scale: 0.72 + hash11(s + 31) * 0.62,
    flipped: hash11(s + 43) > 0.66,
    spin: (hash11(s + 53) - 0.5) * 0.19,
    phase: hash11(s + 67) * Math.PI * 2,
  }
})

const dummy = new Object3D()

export interface SheetFieldProps {
  quality: QualityTier
  reducedMotion: boolean
  drive: FieldDrive
}

export function SheetField({ quality, reducedMotion, drive }: SheetFieldProps) {
  const count = COUNT_BY_TIER[quality]
  const still = reducedMotion

  const built = useMemo(() => {
    const geometry = new PlaneGeometry(SHEET_W, SHEET_H, 16, 10)

    const phase = new Float32Array(MAX_BLANKS)
    const seed = new Float32Array(MAX_BLANKS)
    const amp = new Float32Array(MAX_BLANKS)
    for (let i = 0; i < MAX_BLANKS; i++) {
      phase[i] = BLANKS[i].phase
      seed[i] = hash11(i * 2.91 + 5.3)
      amp[i] = 0.72 + hash11(i * 4.07 + 13.1) * 0.6
    }
    geometry.setAttribute('aPhase', new InstancedBufferAttribute(phase, 1))
    geometry.setAttribute('aSeed', new InstancedBufferAttribute(seed, 1))
    geometry.setAttribute('aAmp', new InstancedBufferAttribute(amp, 1))

    // Blank stock is flatter than printed stock: it is meant to sit behind the
    // four covers, not compete with them.
    const material = makePaperMaterial({ levels: [0.7, 1.12], grain: 0.055 })

    return { geometry, material }
  }, [])

  useEffect(
    () => () => {
      built.geometry.dispose()
      built.material.dispose()
    },
    [built],
  )

  const mesh = useRef<InstancedMesh>(null)

  useFrame(() => {
    const m = mesh.current
    if (!m || count === 0) return

    const u = built.material.uniforms
    u.uTime.value = drive.clock
    u.uCurl.value = drive.curl
    u.uOpacity.value = drive.fade

    const t = drive.clock
    m.count = count

    for (let i = 0; i < count; i++) {
      const b = BLANKS[i]
      const d = still ? b.dStill : wrapD(b.d - drive.travel)

      // Past the lens plane: shrink it to nothing far away rather than pay for a
      // sheet that is behind the camera.
      if (d <= 0.8) {
        dummy.position.set(0, 0, D_FAR * 4)
        dummy.scale.setScalar(0.0001)
        dummy.quaternion.identity()
        dummy.updateMatrix()
        m.setMatrixAt(i, dummy.matrix)
        continue
      }

      const spin = still ? 0 : t * b.spin
      const ry = (b.flipped ? Math.PI : 0) + spin + 0.3 * Math.sin(t * 0.16 + b.phase)
      const rx = 0.26 * Math.sin(t * 0.13 + b.phase * 1.4) - 0.08
      const rz = 0.34 * Math.sin(t * 0.11 + b.phase * 0.6)

      // Bounded by MAX_DRIFT, which the resting offsets above already allow for.
      const drift = still ? 0 : 0.7
      const x = b.x + drift * Math.sin(t * 0.17 + b.phase)
      const y = b.y + drift * 0.6 * Math.cos(t * 0.14 + b.phase * 1.7)

      aimSheet(dummy, x, y, d, rx, ry, rz)
      dummy.scale.setScalar(b.scale)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }

    m.instanceMatrix.needsUpdate = true
  })

  if (count === 0) return null

  return (
    <instancedMesh
      ref={mesh}
      name="writing-blank-field"
      args={[built.geometry, built.material, MAX_BLANKS]}
      count={count}
      frustumCulled={false}
    />
  )
}
