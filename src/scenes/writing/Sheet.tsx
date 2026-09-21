'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CanvasTexture,
  Color,
  DoubleSide,
  Euler,
  LinearFilter,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Mesh,
  type Object3D,
} from 'three'
import type { Article } from '@/data/articles'
import type { QualityTier } from '@/engine/types'
import { FRAGMENT_PRELUDE, VERTEX_PRELUDE } from '@/lib/shader'
import { hash11 } from '@/lib/math'
import curlVert from './shaders/curl.vert'
import paperFrag from './shaders/paper.frag'

/* -------------------------------------------------------------------------- */
/* The corridor                                                                */
/* -------------------------------------------------------------------------- */

/**
 * THE FIELD IS AUTHORED IN CAMERA SPACE and the parent group in `Scene.tsx` puts
 * that space where the camera is. Every sheet position below is therefore
 * `(x, y, -d)`: `d` units in front of the lens, `x` right, `y` up.
 *
 * This is not a shortcut around "author in local coordinates" — the group IS a
 * local child of the station anchor and never leaves it. It is the only layout
 * that survives this station's camera. The path runs from local `(32, 1.5, 57)`
 * through `(10, 2, 27)` to `(1, 3.2, 11)`: 60 units of approach, bending 9 units
 * off the straight line at the midpoint, with the view direction swinging about
 * 30 degrees as it goes. A corridor of sheets nailed to the local Z axis would sit
 * off in the right of frame for the first half of the station and then slide
 * through it. There is no other geometry here to parallax against — the station is
 * empty sky — so nothing is lost by carrying the field with the lens, and what is
 * gained is that a sheet is legible at every single progress value.
 *
 * Parallax is still real: a sheet holds its `(x, y)` while `d` collapses from 38
 * to nothing, which is the whole perspective sweep from vanishing point to frame
 * edge.
 */

export const SHEET_W = 1.4
export const SHEET_H = 0.9

/**
 * Furthest a sheet gets before it is worth drawing, in units ahead of the lens.
 * Pulled in from 46: at 40+ units a sheet is sixty screen pixels wide and all it
 * buys is a thinner stream everywhere else, since the count is fixed by the
 * budget rather than by the corridor length.
 */
export const D_FAR = 38
/**
 * How far past the lens plane a sheet travels before it wraps back to D_FAR. Only
 * just past: a sheet stops drawing the moment it crosses the lens, so every unit
 * of corridor behind that is a sheet paying for nothing.
 */
export const D_NEAR = -2
const D_SPAN = D_FAR - D_NEAR

export const wrapD = (d: number): number =>
  (((d - D_NEAR) % D_SPAN) + D_SPAN) % D_SPAN + D_NEAR

/**
 * No sheet centre is ever closer to the lens axis than this, drift included. The
 * camera near plane is 0.1 and the largest sheet's half-diagonal is about 1.3, so
 * a 2.4-unit floor leaves a unit of clearance at the instant a sheet crosses the
 * lens plane — which is what keeps "no sheet clips the near plane" true by
 * construction rather than by luck. Both `FEATURED_SLOTS` below (min radius 4.2,
 * max drift 0.61) and `SheetField`'s generated offsets are checked against it.
 */
export const MIN_RADIUS = 2.4

/** Written by `Scene.tsx` every frame, read by every sheet. Never allocated. */
export interface FieldDrive {
  /** seconds; stops advancing under reduced motion */
  clock: number
  /** units travelled along the corridor. Sheets subtract it, so up-scroll rewinds. */
  travel: number
  /** 0 = flat, 1 = full curl */
  curl: number
  /** 0..1 station fade, so the field is not floating over the neighbours */
  fade: number
}

/* -------------------------------------------------------------------------- */
/* Paper material                                                              */
/* -------------------------------------------------------------------------- */

/** Paper stock, face up. Neutral rather than warm: under ACES anything warmer
 *  than this comes back cream, and cream reads as old paper, not fresh print. */
const FRONT = new Color('#FBFCFB')
/**
 * The reverse of the page: cooler, darker, desaturated. Deliberately a long way
 * from the front — this is the only thing that makes a turning sheet readable.
 */
const BACK = new Color('#B4C3D7')

/** Key direction in VIEW space: over the viewer's left shoulder, from above. */
const KEY = new Vector3(-0.38, 0.72, 0.58).normalize()

const SIZE = new Vector2(SHEET_W, SHEET_H)

export interface PaperMaterialOptions {
  map?: Texture | null
  /** ambient floor, key gain */
  levels?: [number, number]
  grain?: number
}

export const makePaperMaterial = ({
  map = null,
  levels = [0.62, 1.22],
  grain = 0.05,
}: PaperMaterialOptions = {}): ShaderMaterial =>
  new ShaderMaterial({
    vertexShader: `${VERTEX_PRELUDE}\n${curlVert}`,
    fragmentShader: `${FRAGMENT_PRELUDE}\n${paperFrag}`,
    defines: map ? { HAS_MAP: '' } : {},
    uniforms: {
      ...UniformsUtils.clone(UniformsLib.fog),
      uTime: { value: 0 },
      uCurl: { value: 0 },
      uSize: { value: SIZE.clone() },
      uPhase: { value: 0 },
      uSeed: { value: 0 },
      uFront: { value: FRONT.clone() },
      uBack: { value: BACK.clone() },
      uKey: { value: KEY.clone() },
      uLevels: { value: new Vector2(levels[0], levels[1]) },
      uGrain: { value: grain },
      uOpacity: { value: 1 },
      ...(map ? { uMap: { value: map } } : null),
    },
    side: DoubleSide,
    fog: true,
    /**
     * Transparent with depth writing still on. At the station edges the field fades
     * out rather than popping, and at full opacity the blend is a no-op, so the
     * usual transparent-sorting hazard never actually arises.
     */
    transparent: true,
    depthWrite: true,
  })

/* -------------------------------------------------------------------------- */
/* Procedural covers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * A4 has not landed: `public/images/article-*.jpg` do not exist. Requesting them
 * would 404 on every page load — a console error and a failed probe — so the four
 * featured sheets print their own cover into a canvas instead.
 *
 * Flip this to `true` the moment the four files are in `public/images`; everything
 * below already honours `article.image`.
 */
const USE_ARTICLE_IMAGES = false

const TEX_W = 512
const TEX_H = 330

/** One brand ramp per article, so the four are distinguishable at 40 units out. */
const RAMPS: readonly [string, string][] = [
  ['#2563EB', '#3B82F6'],
  ['#1D4ED8', '#2E6BE6'],
  ['#1E40AF', '#3B82F6'],
  ['#2563EB', '#60A5FA'],
]

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
      if (lines.length === maxLines - 1) break
    } else {
      line = next
    }
  }
  if (line && lines.length < maxLines) lines.push(line)
  return lines
}

/**
 * The cover, as a printed page rather than a full-bleed image: a brand masthead
 * band, the category, the headline, three rules standing in for body copy, and the
 * footer link. Printed-page beats photograph here because the sheet has to still
 * read as PAPER when it turns over and shows its blank reverse.
 */
const makeCoverTexture = (article: Article, index: number): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    const empty = new CanvasTexture(canvas)
    empty.colorSpace = SRGBColorSpace
    return empty
  }

  // ---- stock --------------------------------------------------------------
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  // ---- masthead -----------------------------------------------------------
  const BAND = 104
  const [c0, c1] = RAMPS[index % RAMPS.length]
  const grad = ctx.createLinearGradient(0, 0, TEX_W, BAND)
  grad.addColorStop(0, c0)
  grad.addColorStop(1, c1)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, TEX_W, BAND)

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = '700 19px Inter, ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(article.category.toUpperCase(), 30, 46)

  ctx.fillStyle = 'rgba(255,255,255,0.68)'
  ctx.font = '600 16px Inter, ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(article.date.toUpperCase(), 30, 76)

  // ---- headline -----------------------------------------------------------
  ctx.fillStyle = '#0A1220'
  ctx.font = '800 31px Inter, ui-sans-serif, system-ui, sans-serif'
  const lines = wrapText(ctx, article.title, TEX_W - 60, 3)
  lines.forEach((line, i) => ctx.fillText(line, 30, BAND + 52 + i * 38))

  // ---- body, as rules -----------------------------------------------------
  const bodyTop = BAND + 56 + lines.length * 38
  ctx.fillStyle = '#DCE5F1'
  for (let i = 0; i < 4; i++) {
    const w = TEX_W - 60 - (i === 3 ? 150 : (i * 37) % 60)
    ctx.fillRect(30, bodyTop + i * 17, w, 6)
  }

  // ---- footer -------------------------------------------------------------
  ctx.fillStyle = '#E3EAF3'
  ctx.fillRect(30, TEX_H - 46, TEX_W - 60, 1)
  ctx.fillStyle = '#2563EB'
  ctx.font = '700 17px Inter, ui-sans-serif, system-ui, sans-serif'
  ctx.fillText('Read Article  →', 30, TEX_H - 20)

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.minFilter = LinearFilter
  tex.magFilter = LinearFilter
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

/* -------------------------------------------------------------------------- */
/* Slots                                                                       */
/* -------------------------------------------------------------------------- */

export interface Slot {
  x: number
  y: number
  /** distance ahead of the lens at travel = 0 */
  d: number
  scale: number
}

/**
 * Four featured sheets, spaced EVENLY around the 40-unit cycle, 10 apart. Even
 * spacing is the point: cluster them and there is a long stretch of the cycle with
 * no cover closer than 25 units, where the station has four illegible white stamps
 * in it and nothing to read. At this pitch there is always exactly one cover inside
 * the first 10 units, which is the band where a 2.2-unit page fills a third of the
 * frame.
 *
 * Sides alternate; the lateral radius is 4.2–4.6, which puts a sheet near the
 * centre of frame while it is 20 units out and carries it off the edge as it
 * passes.
 *
 * The whole set is lifted about a unit, the same as the blank field. Once
 * `SectionShell` pins, the copy owns the middle and lower thirds of the screen and
 * the only band the 3D really has to itself is the top — so that is where the
 * stream is aimed.
 */
export const FEATURED_SLOTS: readonly Slot[] = [
  { x: -3.6, y: 2.4, d: 33, scale: 1.6 },
  { x: 4.2, y: -0.25, d: 23, scale: 1.6 },
  { x: -4.5, y: -0.65, d: 13, scale: 1.55 },
  { x: 3.3, y: 2.65, d: 3, scale: 1.5 },
]

/**
 * With travel and curl switched off — the low tier, and reduced motion at any tier
 * — the four sheets have to compose as a still life instead. Three sit in the band
 * above the DOM overlay, which is the only part of the frame the copy does not own
 * once the shell pins, at three different depths so the group has a front and a
 * back; the fourth is low and left, behind the first card, as depth. Nothing is
 * going to arrive later to fill the frame, so nothing here is allowed to be
 * halfway out of it.
 */
export const LOW_SLOTS: readonly Slot[] = [
  { x: -6.4, y: 2.2, d: 15.0, scale: 1.55 },
  { x: 6.2, y: 3.6, d: 12.5, scale: 1.55 },
  { x: -4.0, y: -2.3, d: 9.5, scale: 1.45 },
  { x: 2.8, y: 2.0, d: 7.0, scale: 1.4 },
]

/* -------------------------------------------------------------------------- */
/* Sheet                                                                       */
/* -------------------------------------------------------------------------- */

const ORIGIN = new Vector3(0, 0, 0)
const UP = new Vector3(0, 1, 0)
const _pos = new Vector3()
const _m4 = new Matrix4()
const _q = new Quaternion()
const _tilt = new Quaternion()
const _euler = new Euler()

/**
 * Point a sheet's +Z (the plane's own normal) back at the lens, then tip it.
 * Facing the lens is what keeps a cover readable; the tip is what stops four
 * sheets from looking like four billboards.
 */
export const aimSheet = (
  mesh: Object3D,
  x: number,
  y: number,
  d: number,
  rx: number,
  ry: number,
  rz: number,
): void => {
  _pos.set(x, y, -d)
  mesh.position.copy(_pos)
  // eye at the lens, target at the sheet: the resulting +Z runs sheet -> lens.
  _m4.lookAt(ORIGIN, _pos, UP)
  _q.setFromRotationMatrix(_m4)
  _euler.set(rx, ry, rz)
  _tilt.setFromEuler(_euler)
  mesh.quaternion.copy(_q).multiply(_tilt)
}

export interface SheetProps {
  article: Article
  index: number
  geometry: BufferGeometry
  quality: QualityTier
  reducedMotion: boolean
  drive: FieldDrive
}

export function Sheet({
  article,
  index,
  geometry,
  quality,
  reducedMotion,
  drive,
}: SheetProps) {
  const low = quality === 'low'
  const still = low || reducedMotion

  const texture = useMemo(() => makeCoverTexture(article, index), [article, index])

  const material = useMemo(
    () =>
      makePaperMaterial({
        map: texture,
        // The printed side needs a narrower range than blank stock or the masthead
        // blows out at the top of the curl and the headline loses its contrast.
        levels: [0.68, 1.16],
        grain: 0.035,
      }),
    [texture],
  )

  useEffect(() => {
    material.uniforms.uPhase.value = hash11(index * 7.31 + 2.4) * Math.PI * 2
    material.uniforms.uSeed.value = hash11(index * 3.77 + 9.1)
  }, [material, index])

  useEffect(
    () => () => {
      material.dispose()
      texture.dispose()
    },
    [material, texture],
  )

  /**
   * The real cover, once A4 ships. Guarded so that today, with the four JPEGs
   * missing, the page never fires a request that 404s.
   */
  useEffect(() => {
    if (!USE_ARTICLE_IMAGES) return
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
      material.uniforms.uMap.value = real
    }
    img.src = article.image
    return () => {
      cancelled = true
    }
  }, [material, article.image])

  const mesh = useRef<Mesh>(null)
  // Both still cases — low tier and reduced motion — get the still-life layout.
  // The animated slots put a sheet at 4.5 units, which is right when it is passing
  // and absurd when it is frozen there.
  const slot = (still ? LOW_SLOTS : FEATURED_SLOTS)[index] ?? FEATURED_SLOTS[0]
  const phase = hash11(index * 7.31 + 2.4) * Math.PI * 2

  // No renderPriority. Ever — a non-zero one switches R3F to manual rendering and
  // the whole page stops drawing.
  useFrame(() => {
    const m = mesh.current
    if (!m) return

    const u = material.uniforms
    u.uTime.value = drive.clock
    u.uCurl.value = drive.curl
    u.uOpacity.value = drive.fade

    const d = still ? slot.d : wrapD(slot.d - drive.travel)
    const t = drive.clock

    // A featured sheet only ever tips: its yaw stays inside +/-0.45 rad of facing
    // the lens so the cover is never edge-on while it is close enough to read.
    const ry = still ? 0.2 : 0.42 * Math.sin(t * 0.21 + phase)
    const rx = still ? -0.12 : -0.1 + 0.18 * Math.sin(t * 0.17 + phase * 1.3)
    const rz = still ? 0.1 : 0.2 * Math.sin(t * 0.13 + phase * 0.7)

    const drift = still ? 0 : 0.5
    const x = slot.x + drift * Math.sin(t * 0.19 + phase)
    const y = slot.y + drift * 0.7 * Math.cos(t * 0.15 + phase * 1.6)

    aimSheet(m, x, y, d, rx, ry, rz)
    m.scale.setScalar(slot.scale)
    // Past the lens plane it is behind the camera and there is nothing to draw:
    // these meshes are frustumCulled={false}, so the test has to be made here.
    m.visible = d > 0.8
  })

  return (
    <mesh
      ref={mesh}
      name={`writing-sheet-${article.id}`}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  )
}
