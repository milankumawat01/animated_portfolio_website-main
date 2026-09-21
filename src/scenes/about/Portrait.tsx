'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import {
  CanvasTexture,
  Color,
  DoubleSide,
  LinearFilter,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
  type BufferGeometry,
  type Group,
  type IUniform,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { QualityTier } from '@/engine/types'
import { damp, easeOutBack, saturate } from '@/lib/math'

/* -------------------------------------------------------------------------- */
/* The placeholder                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A2 has not landed: `public/images/portrait.jpg` does not exist. Requesting it
 * anyway would 404 on every single page load — a console error and a network error
 * that the station probe reports, forever.
 *
 * So the card draws its own: a brand-tinted studio gradient with a soft head-and-
 * shoulders silhouette, a rim light and a vignette. At the ~180 screen pixels this
 * card occupies for most of the station it reads as "a portrait, not yet loaded"
 * rather than as a grey rectangle, which is the honest signal.
 *
 * **Flip this to `true` the moment the file is in `public/images/`.** Everything
 * below already honours `PORTRAIT_SRC`, including an `onerror` that keeps the
 * procedural card if the file is ever removed again.
 */
const USE_PORTRAIT_IMAGE = false
const PORTRAIT_SRC = '/images/portrait.jpg'

const TEX_W = 448
const TEX_H = 560

/** Builds a rounded-rect path. Does not fill — the caller decides. */
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void => {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

const makePortraitTexture = (): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    const empty = new CanvasTexture(canvas)
    empty.colorSpace = SRGBColorSpace
    return empty
  }

  // ---- backdrop -----------------------------------------------------------
  const bg = ctx.createLinearGradient(0, 0, TEX_W * 0.6, TEX_H)
  bg.addColorStop(0, '#3D6FC2')
  bg.addColorStop(0.55, '#345FA8')
  bg.addColorStop(1, '#101E36')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  // key light, upper left
  const key = ctx.createRadialGradient(
    TEX_W * 0.26,
    TEX_H * 0.16,
    0,
    TEX_W * 0.26,
    TEX_H * 0.16,
    TEX_H * 0.85,
  )
  key.addColorStop(0, 'rgba(226,238,255,0.55)')
  key.addColorStop(0.45, 'rgba(120,168,245,0.18)')
  key.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = key
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  // ---- silhouette ---------------------------------------------------------
  const cx = TEX_W * 0.5
  const headR = TEX_W * 0.145
  const headY = TEX_H * 0.34

  // A little blur: the figure should read as an out-of-focus person, not as a
  // vector icon of one. Chromium honours ctx.filter; anywhere that does not, the
  // card simply comes out crisper.
  ctx.filter = 'blur(7px)'

  const figure = ctx.createLinearGradient(0, headY - headR, 0, TEX_H)
  figure.addColorStop(0, 'rgba(10,22,44,0.62)')
  figure.addColorStop(1, 'rgba(8,16,34,0.80)')
  ctx.fillStyle = figure

  // shoulders
  ctx.beginPath()
  ctx.moveTo(cx - TEX_W * 0.46, TEX_H)
  ctx.bezierCurveTo(
    cx - TEX_W * 0.42,
    TEX_H * 0.70,
    cx - TEX_W * 0.20,
    TEX_H * 0.56,
    cx,
    TEX_H * 0.555,
  )
  ctx.bezierCurveTo(
    cx + TEX_W * 0.20,
    TEX_H * 0.56,
    cx + TEX_W * 0.42,
    TEX_H * 0.70,
    cx + TEX_W * 0.46,
    TEX_H,
  )
  ctx.closePath()
  ctx.fill()

  // neck + head
  ctx.fillRect(cx - headR * 0.44, headY, headR * 0.88, TEX_H * 0.24)
  ctx.beginPath()
  ctx.ellipse(cx, headY, headR, headR * 1.16, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.filter = 'none'

  // rim light down the left edge of the figure
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const rim = ctx.createLinearGradient(cx - headR * 1.6, 0, cx - headR * 0.4, 0)
  rim.addColorStop(0, 'rgba(0,0,0,0)')
  rim.addColorStop(1, 'rgba(147,197,253,0.42)')
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.ellipse(cx, headY, headR, headR * 1.16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(cx - TEX_W * 0.4, TEX_H * 0.6, TEX_W * 0.26, TEX_H * 0.4)
  ctx.restore()

  // ---- vignette -----------------------------------------------------------
  const vig = ctx.createRadialGradient(
    TEX_W * 0.5,
    TEX_H * 0.42,
    TEX_H * 0.22,
    TEX_W * 0.5,
    TEX_H * 0.5,
    TEX_H * 0.78,
  )
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(3,8,18,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  // Rounded corners, cut out of the alpha channel so the card reads as a photo
  // and not as a third screen. `alphaTest` on the material keeps it sort-free.
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = '#000'
  roundRect(ctx, 0, 0, TEX_W, TEX_H, 34)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

/* -------------------------------------------------------------------------- */
/* Portrait                                                                    */
/* -------------------------------------------------------------------------- */

const CARD_W = 1.16
const CARD_H = 1.45
/** The glass frame overhangs the photo by this much on every side. */
const FRAME_PAD = 0.1
const FRAME_D = 0.09
const HALF_D = FRAME_D / 2

export interface PortraitProps {
  quality: QualityTier
  reducedMotion: boolean
  /** in desk space */
  position: [number, number, number]
  /** yaw so the card faces the camera path, radians */
  rotationY: number
  /** the station's 0 → 1 assembly. The portrait is the last thing to arrive. */
  reveal: IUniform<number>
  /** where in that 0 → 1 the card starts, and how long it takes */
  delay?: number
  span?: number
}

export function Portrait({
  quality,
  reducedMotion,
  position,
  rotationY,
  reveal,
  delay = 0.55,
  span = 0.4,
}: PortraitProps) {
  const low = quality === 'low'
  const high = quality === 'high'
  const group = useRef<Group>(null)
  const clock = useRef(0)

  const texture = useMemo(() => makePortraitTexture(), [])

  const photoGeometry = useMemo(() => new PlaneGeometry(CARD_W, CARD_H), [])

  const frameGeometry = useMemo<BufferGeometry | null>(
    () =>
      low
        ? null
        : new RoundedBoxGeometry(
            CARD_W + FRAME_PAD * 2,
            CARD_H + FRAME_PAD * 2,
            FRAME_D,
            2,
            0.09,
          ),
    [low],
  )

  const photoMaterial = useMemo(() => {
    const m = new MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new Color('#FFFFFF'),
      // Read through 0.04 of glass at `high`, and against a #F5F8FC page at every
      // tier, a purely lit photo goes muddy. A standing emissive floor fixes it.
      emissiveIntensity: high ? 0.34 : 0.44,
      roughness: 0.85,
      metalness: 0,
      toneMapped: true,
      // rounded corners live in the texture's alpha
      alphaTest: 0.5,
      side: DoubleSide,
    })
    return m
  }, [texture, high])

  /** `medium` — a tinted glass card rather than a true transmission one. */
  const tintedFrame = useMemo(() => {
    if (low || high) return null
    return new MeshStandardMaterial({
      color: '#DCE9FB',
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: 0.45,
      envMapIntensity: 1.2,
    })
  }, [low, high])

  useEffect(
    () => () => {
      texture.dispose()
      photoGeometry.dispose()
      frameGeometry?.dispose()
      photoMaterial.dispose()
      tintedFrame?.dispose()
    },
    [texture, photoGeometry, frameGeometry, photoMaterial, tintedFrame],
  )

  /** The real photo, once A2 ships it. Never requested while the flag is false. */
  useEffect(() => {
    if (!USE_PORTRAIT_IMAGE) return
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      const real = new Texture(img)
      real.colorSpace = SRGBColorSpace
      real.minFilter = LinearFilter
      real.magFilter = LinearFilter
      real.anisotropy = 4
      real.needsUpdate = true
      photoMaterial.map = real
      photoMaterial.emissiveMap = real
      photoMaterial.needsUpdate = true
    }
    img.src = PORTRAIT_SRC
    return () => {
      cancelled = true
    }
  }, [photoMaterial])

  // No renderPriority. Ever.
  useFrame((_, rawDelta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(rawDelta, 0.1)
    clock.current += dt

    const t = saturate((reveal.value - delay) / span)
    const s = reducedMotion ? (t > 0 ? 1 : 0) : easeOutBack(t)
    g.scale.setScalar(s)

    // A slow float, and a lean that settles as the card arrives. Under reduced
    // motion the card simply sits where it lands.
    const bob = reducedMotion ? 0 : Math.sin(clock.current * 0.62) * 0.045
    g.position.set(position[0], position[1] + bob, position[2])
    g.rotation.y = damp(g.rotation.y, rotationY, 4, dt)
    g.rotation.z = reducedMotion ? 0 : Math.sin(clock.current * 0.43) * 0.012
    g.rotation.x = reducedMotion ? 0 : Math.sin(clock.current * 0.51 + 1.2) * 0.01
  })

  return (
    <group ref={group} name="about-portrait" scale={0}>
      {frameGeometry ? (
        <mesh geometry={frameGeometry} material={tintedFrame ?? undefined}>
          {high ? (
            <MeshTransmissionMaterial
              samples={4}
              resolution={512}
              transmission={1}
              thickness={0.15}
              roughness={0.035}
              chromaticAberration={0.05}
              anisotropicBlur={0.1}
              distortion={0}
              temporalDistortion={0}
              ior={1.42}
              attenuationDistance={3}
              attenuationColor="#E9F1FF"
              color="#FFFFFF"
              backside={false}
            />
          ) : null}
        </mesh>
      ) : null}

      <mesh
        geometry={photoGeometry}
        material={photoMaterial}
        // At `high` the photo sits behind the glass front face so the edges of the
        // frame refract it. At `medium` and `low` there is nothing to refract
        // through, so it comes out in front instead.
        position={[0, 0, high ? HALF_D - 0.04 : low ? 0 : HALF_D + 0.008]}
      />
    </group>
  )
}
