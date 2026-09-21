'use client'

import { useEffect, useMemo, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CanvasTexture,
  Color,
  LinearFilter,
  Material,
  MeshStandardMaterial,
  SRGBColorSpace,
  Texture,
  type BufferGeometry,
  type Group,
  type IUniform,
} from 'three'
import type { QualityTier } from '@/engine/types'
import type { Project } from '@/data/projects'
import { VERTEX_PRELUDE } from '@/lib/shader'
import { clamp, damp } from '@/lib/math'
import { scrollState } from '@/store/useScroll'
import { useProjectHover } from './useProjectHover'
import rippleChunk from './shaders/ripple.vert'

/* -------------------------------------------------------------------------- */
/* Placeholder screenshots                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A3 has not landed: `public/images/project-*.png` do not exist. Rather than issue
 * four requests that 404 (which shows up as a console + network error on every page
 * load, including the probe), the slabs draw their own screenshot into a canvas.
 *
 * Flip this to `true` the moment the four PNGs are in `public/images` — everything
 * below already honours `project.image`.
 */
const USE_PROJECT_IMAGES = false

const TEX_W = 640
const TEX_H = 400

interface Palette {
  bg0: string
  bg1: string
  chrome: string
  panel: string
  line: string
  fg: string
  mut: string
  brand: string
}

const PALETTE: Record<Project['tone'], Palette> = {
  dark: {
    bg0: '#080D18',
    bg1: '#16233C',
    chrome: '#0C1424',
    panel: 'rgba(255,255,255,0.055)',
    line: 'rgba(255,255,255,0.12)',
    fg: '#F2F6FC',
    mut: '#8B9AAF',
    brand: '#3B82F6',
  },
  light: {
    // Deliberately deeper than a real light UI would be. Read through transmission
    // plus bloom on a #F5F8FC page, a true-white screenshot disappears entirely.
    bg0: '#F4F9FF',
    bg1: '#BED5F2',
    chrome: '#E3EDFA',
    panel: 'rgba(10,18,32,0.07)',
    line: 'rgba(10,18,32,0.16)',
    fg: '#08111F',
    mut: '#47586F',
    brand: '#1D4ED8',
  },
}

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

/**
 * A believable product screenshot, drawn procedurally: window chrome, a sidebar, the
 * project name as the page title, three stat tiles and a bar chart. It has to survive
 * being refracted through 0.04 of glass at roughly 250 screen pixels wide, so
 * everything is large, high contrast, and there is no body copy to smear.
 */
const makeProjectTexture = (project: Project): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext('2d')
  const p = PALETTE[project.tone]

  if (!ctx) {
    const empty = new CanvasTexture(canvas)
    empty.colorSpace = SRGBColorSpace
    return empty
  }

  // ---- page --------------------------------------------------------------
  const grad = ctx.createLinearGradient(0, 0, TEX_W, TEX_H)
  grad.addColorStop(0, p.bg0)
  grad.addColorStop(1, p.bg1)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  // brand glow, bottom right
  const glow = ctx.createRadialGradient(TEX_W * 0.86, TEX_H * 0.9, 0, TEX_W * 0.86, TEX_H * 0.9, 300)
  glow.addColorStop(0, project.tone === 'dark' ? 'rgba(59,130,246,0.42)' : 'rgba(37,99,235,0.2)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  // ---- window chrome ------------------------------------------------------
  ctx.fillStyle = p.chrome
  ctx.fillRect(0, 0, TEX_W, 34)
  ctx.fillStyle = p.line
  ctx.fillRect(0, 34, TEX_W, 1)
  const dots = ['#FF5F57', '#FEBC2E', '#28C840']
  dots.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(22 + i * 20, 17, 5.5, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = p.panel
  roundRect(ctx, 120, 8, TEX_W - 160, 18, 9)
  ctx.fill()

  // ---- sidebar ------------------------------------------------------------
  const SIDE = 96
  ctx.fillStyle = p.panel
  ctx.fillRect(0, 35, SIDE, TEX_H - 35)
  ctx.fillStyle = p.brand
  roundRect(ctx, 18, 52, 22, 22, 7)
  ctx.fill()
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i === 1 ? p.brand : p.line
    roundRect(ctx, 18, 96 + i * 26, i === 1 ? 60 : 44 + ((i * 13) % 20), 9, 4)
    ctx.fill()
  }

  // ---- title --------------------------------------------------------------
  ctx.fillStyle = p.brand
  ctx.font = '700 17px Inter, ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(project.tags[0].toUpperCase(), SIDE + 28, 78)

  ctx.fillStyle = p.fg
  ctx.font = '800 54px Inter, ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(project.name, SIDE + 26, 132)

  // ---- stat tiles ---------------------------------------------------------
  const tileW = (TEX_W - SIDE - 56) / 3 - 12
  const stats = ['98%', '4.2k', '12ms']
  for (let i = 0; i < 3; i++) {
    const x = SIDE + 26 + i * (tileW + 16)
    ctx.fillStyle = p.panel
    roundRect(ctx, x, 156, tileW, 62, 12)
    ctx.fill()
    ctx.strokeStyle = p.line
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = i === 0 ? p.brand : p.fg
    ctx.font = '800 26px Inter, ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(stats[i], x + 14, 192)
    ctx.fillStyle = p.mut
    ctx.font = '600 12px Inter, ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(['MATCH', 'RECORDS', 'P95'][i], x + 14, 208)
  }

  // ---- bar chart ----------------------------------------------------------
  const chartX = SIDE + 26
  const chartY = 238
  const chartW = TEX_W - SIDE - 56
  const chartH = 104
  ctx.fillStyle = p.panel
  roundRect(ctx, chartX, chartY, chartW, chartH, 12)
  ctx.fill()
  ctx.strokeStyle = p.line
  ctx.lineWidth = 1
  ctx.stroke()

  const bars = 11
  const bw = (chartW - 32) / bars - 7
  for (let i = 0; i < bars; i++) {
    const h = 18 + ((Math.sin(i * 1.7 + project.name.length) * 0.5 + 0.5) * (chartH - 44))
    ctx.fillStyle = i === bars - 2 ? p.brand : project.tone === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(10,18,32,0.18)'
    roundRect(ctx, chartX + 16 + i * (bw + 7), chartY + chartH - 14 - h, bw, h, 4)
    ctx.fill()
  }

  // ---- tag strip ----------------------------------------------------------
  let tx = chartX
  ctx.font = '600 13px Inter, ui-sans-serif, system-ui, sans-serif'
  for (const tag of project.tags) {
    const w = ctx.measureText(tag).width + 22
    ctx.fillStyle = p.panel
    roundRect(ctx, tx, TEX_H - 40, w, 24, 8)
    ctx.fill()
    ctx.fillStyle = p.mut
    ctx.fillText(tag, tx + 11, TEX_H - 23)
    tx += w + 8
  }

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

/* -------------------------------------------------------------------------- */
/* Slab                                                                        */
/* -------------------------------------------------------------------------- */

/** How close the image plane sits to the slab's front face, in world units. */
const IMAGE_INSET = 0.04
/** Half the slab depth, from the 1.6 × 1.0 × 0.06 spec. */
const HALF_DEPTH = 0.03

export interface SlabActivity {
  /** 0..1, how close this slab is to being the carousel's active one */
  active: number
}

export interface SlabProps {
  project: Project
  index: number
  quality: QualityTier
  reducedMotion: boolean
  /** shared 1.6 × 1.0 × 0.06 rounded box */
  slabGeometry: BufferGeometry
  /** shared segmented plane; the ripple needs the vertices */
  planeGeometry: BufferGeometry
  /**
   * THE shared transmission material. Undefined for the one slab that hosts it as a
   * child — see the note in Scene.tsx about why exactly one instance may exist.
   */
  material?: Material
  /** the `<MeshTransmissionMaterial>` element, on the hosting slab only */
  children?: ReactNode
  /** written every frame by Scene's useFrame */
  activity: SlabActivity
  groupRef: (g: Group | null) => void
}

export function Slab({
  project,
  index,
  quality,
  reducedMotion,
  slabGeometry,
  planeGeometry,
  material,
  children,
  activity,
  groupRef,
}: SlabProps) {
  const low = quality === 'low'
  const rippleOn = !low && !reducedMotion

  const texture = useMemo(() => makeProjectTexture(project), [project])

  /** Uniforms shared with the injected ripple chunk. */
  const uniforms = useMemo<Record<'uTime' | 'uAmp' | 'uScale', IUniform<number>>>(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0 },
      uScale: { value: 0.045 },
    }),
    [],
  )

  const imageMaterial = useMemo(() => {
    const m = new MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new Color('#FFFFFF'),
      // The screenshot has to survive being read through glass. A standing emissive
      // floor is what keeps it from going muddy once the transmission buffer and the
      // ACES curve have both had a go at it.
      emissiveIntensity: low ? 0.55 : 0.42,
      roughness: 0.82,
      metalness: 0.0,
      toneMapped: true,
    })

    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime
      shader.uniforms.uAmp = uniforms.uAmp
      shader.uniforms.uScale = uniforms.uScale
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${VERTEX_PRELUDE}\n${rippleChunk}`)
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n  transformed = rippleDisplace(transformed, uv);',
        )
    }

    return m
  }, [texture, low, uniforms])

  useEffect(
    () => () => {
      imageMaterial.dispose()
      texture.dispose()
    },
    [imageMaterial, texture],
  )

  /**
   * The real screenshot, once A3 ships it. Guarded so that today — with the four PNGs
   * missing — the page never fires a request that 404s. `onerror` keeps the
   * procedural texture in place if a file is ever removed again.
   */
  useEffect(() => {
    if (!USE_PROJECT_IMAGES) return
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
      imageMaterial.map = real
      imageMaterial.emissiveMap = real
      imageMaterial.needsUpdate = true
    }
    img.src = project.image
    return () => {
      cancelled = true
    }
  }, [imageMaterial, project.image])

  // No renderPriority. Ever.
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    uniforms.uTime.value += dt

    const target = rippleOn ? clamp(Math.abs(scrollState.velocity), 0, 1.4) : 0
    uniforms.uAmp.value = damp(uniforms.uAmp.value, target, 9, dt)

    const hovered = useProjectHover.getState().hovered === project.id
    const base = low ? 0.55 : 0.42
    const wanted = base + activity.active * 0.22 + (hovered ? 0.34 : 0)
    imageMaterial.emissiveIntensity = damp(imageMaterial.emissiveIntensity, wanted, 7, dt)
  })

  return (
    <group ref={groupRef} name={`project-slab-${project.id}`}>
      <mesh geometry={slabGeometry} material={material} renderOrder={index}>
        {children}
      </mesh>
      <mesh
        geometry={planeGeometry}
        material={imageMaterial}
        // Behind the glass at medium/high — you read it through the front 0.04 of the
        // slab. At low the slab is opaque, so it has to come out in front instead.
        position={[0, 0, low ? HALF_DEPTH + 0.012 : HALF_DEPTH - IMAGE_INSET]}
      />
    </group>
  )
}
